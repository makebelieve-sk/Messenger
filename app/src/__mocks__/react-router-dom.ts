import { createElement, type ReactNode } from "react";
import * as ReactRouterDom from "react-router-dom";

const mockNavigate = jest.fn();
const mockLocation = {
	pathname: "/",
	search: "",
	hash: "",
	state: null,
	key: "default",
};

const mockParams = {};

const useNavigate = () => mockNavigate;
const useLocation = () => mockLocation;
const useParams = () => mockParams;

const matchPath = (pattern: string, pathname: string) => {
	if (pattern === pathname) {
		return {
			params: {},
			pathname,
			pattern,
			pathnameBase: pathname,
		};
	}
	return null;
};

const Routes = ({ children }: { children: ReactNode }) => children;
const Route = ({ children }: { children: ReactNode }) => children;
const Navigate = ({ to }: { to: string }) => createElement("div", { "data-testid": "navigate", "data-to": to });

export { useNavigate, mockNavigate, useLocation, mockLocation, useParams, mockParams, matchPath, Routes, Route, Navigate };
export default {
	...ReactRouterDom,
	useNavigate,
	useLocation,
	useParams,
	matchPath,
	Routes,
	Route,
	Navigate,
}; 