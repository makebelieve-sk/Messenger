import { HTTPStatuses } from "common-types";
import { Op, type Transaction } from "sequelize";

import createPhotos, { type CreationAttributes, Photo } from "@core/database/models/photo";
import Repository from "@core/database/Repository";
import { t } from "@service/i18n";
import { RepositoryError } from "@errors/index";
import AliasAssociations from "@utils/associations";
import { getPhotoInfo } from "@utils/files";

interface IGetUserPhoto {
	filters: { userId: string; };
	options: { limit: number; lastCreatedDate: string | null; };
	transaction?: Transaction;
};

// Репозиторий, который содержит методы по работе с моделью Photo
export default class Photos {
	private _model: typeof Photo;

	constructor(private readonly _repo: Repository) {
		this._model = createPhotos(this._repo.sequelize);
	}

	get model() {
		return this._model;
	}

	async create({ userId, photoPath, transaction }: { userId: string; photoPath: string; transaction: Transaction; }) {
		try {
			const photoCreation = await getPhotoInfo(photoPath);
			const newPhoto = await this._model.create({ ...photoCreation, userId }, { transaction });

			return newPhoto.getEntity();
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "Photos", method: "create" }) + (error as Error).message);
		}
	}

	async bulkCreate({ photos, transaction }: { photos: CreationAttributes[]; transaction?: Transaction; }) {
		try {
			return await this._model.bulkCreate(photos, {
				transaction,
				returning: true,
			});
		} catch (error) {
			throw new RepositoryError(
				t("repository.error.internal_db", {
					repo: "Photos",
					method: "bulkCreate",
				}) + (error as Error).message,
			);
		}
	}

	async getById({ photoId, transaction }: { photoId: string; transaction?: Transaction; }) {
		try {
			return await this._model.findByPk(photoId, { transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "Photos", method: "getById" }) + (error as Error).message);
		}
	}

	async getUserPhotos({ filters, options, transaction }: IGetUserPhoto) {
		try {
			const totalPhotos = await this._model.count({
				where: filters,
				include: [
					{
						model: this._repo.users.model,
						as: AliasAssociations.PHOTOS_WITH_USER,
						through: {
							where: { userId: filters.userId },
						},
						attributes: [],
						required: true,
					},
				],
				transaction,
			});

			const where: { userId: string; createdAt?: { [Op.lt]: string; }; } = filters;

			if (options.lastCreatedDate) {
				where.createdAt = {
					[Op.lt]: options.lastCreatedDate,
				};
			}

			const foundPhotos = await this._model.findAll({
				where,
				limit: options.limit,
				transaction,
				include: [
					{
						model: this._repo.users.model,
						as: AliasAssociations.PHOTOS_WITH_USER,
						through: {
							where: { userId: filters.userId },
						},
						attributes: [],
						required: true,
					},
				],
				order: [ [ "createdAt", "DESC" ], [ "id", "DESC" ] ],
			});

			return {
				photos: foundPhotos.map(foundPhoto => foundPhoto.getEntity()),
				count: totalPhotos,
			};
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "Photos", method: "getUserPhotos" }) + (error as Error).message);
		}
	}

	async destroy({ filters, transaction }: { filters: { userId: string; path: string; }; transaction?: Transaction; }) {
		try {
			await this._model.destroy({ where: filters, transaction });
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "Photos", method: "destroy" }) + (error as Error).message);
		}
	}

	async returnDestroyedRow({ filters, transaction }: { filters: { userId: string; path: string }; transaction?: Transaction; }) {
		try {
			const destroyedRow = await this._model.findOne({
				where: filters,
				transaction,
			});

			if (!destroyedRow) {
				throw new RepositoryError(t("repository.error.destroyed_row_not_found"), HTTPStatuses.NotFound);
			}

			await this.destroy({ filters, transaction });

			return destroyedRow.id;
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "Photos", method: "returnDestroyedRow" }) + (error as Error).message);
		}
	}
}
