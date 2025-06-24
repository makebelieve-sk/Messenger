import { IsNotEmpty, IsString } from "class-validator";

// Модель объекта данных в сообщении генерации пинкода
export class PincodeDto {
	@IsString()
	@IsNotEmpty()
	userId: string;

	@IsString()
	@IsNotEmpty()
	pincode: number;
}
