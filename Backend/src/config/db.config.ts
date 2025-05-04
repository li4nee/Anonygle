import { DataSource, DataSourceOptions } from "typeorm";
import { globalSettings } from "./settings.config";

export const AppData: DataSourceOptions = {
  type: "postgres",
  host: globalSettings.DB.HOST,
  port: globalSettings.DB.PORT,
  username: globalSettings.DB.USERNAME,
  password: globalSettings.DB.PASSWORD,
  database: globalSettings.DB.DATABASE,
  entities: [],
  synchronize: true,
  migrations: ["../migrations/*.ts"],
  logging: false,
};

export const AppDataSource = new DataSource(AppData);
