import winston, { Logger,format, transports } from 'winston';
import { VKApi } from './bot';
import { config, loggerLevels } from './config';
import { GroupController, UserController, SubGroupController } from './controllers';

export class ApplicationModule {
  private readonly userController: UserController;

  private readonly groupController: GroupController;

  private readonly subGroupController: SubGroupController;

  private readonly vkApiHandler: VKApi;

  private readonly logger: Logger;

  constructor() {
    this.logger = winston.createLogger({
      levels: {
        ...loggerLevels,
      },
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.json(),
      ),
      transports: [new transports.Console()],
    });
    this.userController = new UserController();
    this.groupController = new GroupController();
    this.subGroupController = new SubGroupController();
    this.vkApiHandler = new VKApi(
      this.logger,
      this.userController,
      this.groupController,
      this.subGroupController,
      config.VK_API_TOKEN,
      config.VK_API_LIMIT,
    );
  }

  public start(): void {
    this.vkApiHandler.initializeHandlers();
    this.vkApiHandler.start();
  }
}
