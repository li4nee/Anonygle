import { DataSource, DataSourceOptions } from "typeorm";
import { globalSettings } from "./settings.config";
import { SessionDetails } from "src/entity/sessionDetails.entity";
import { ChatPairing } from "src/entity/chatParings.entity";
import { ModerationReport } from "src/entity/report.entity";
import { AdminCredential } from "src/entity/adminCredential.entity";

export const AppData: DataSourceOptions = {
  type: "postgres",
  host: globalSettings.DB.HOST,
  port: globalSettings.DB.PORT,
  username: globalSettings.DB.USERNAME,
  password: globalSettings.DB.PASSWORD,
  database: globalSettings.DB.DATABASE,
  entities: [SessionDetails, ChatPairing, ModerationReport, AdminCredential],
  synchronize: globalSettings.WORK_ENVIRONMENT !== "PRODUCTION",
  migrations: ["dist/migrations/*.js"],
  logging: false,
};

export const AppDataSource = new DataSource(AppData);
