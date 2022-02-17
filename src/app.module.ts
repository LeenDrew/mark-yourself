import { VKApi } from './bot';
import { config } from './config';
import { GroupController, UserController, SubGroupController } from './controllers';

export class ApplicationModule {
  private readonly userController: UserController;

  private readonly groupController: GroupController;

  private readonly subGroupController: SubGroupController;

  private readonly vkApiHandler: VKApi;

  constructor() {
    this.userController = new UserController();
    this.groupController = new GroupController();
    this.subGroupController = new SubGroupController();
    this.vkApiHandler = new VKApi(
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
