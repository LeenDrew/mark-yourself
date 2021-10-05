import { VK, Keyboard, MessageContext, ButtonColor } from 'vk-io';
import { HearManager } from '@vk-io/hear';
import * as userController from '../controllers/user-controller';
import * as groupController from '../controllers/group-controller';
import * as subGroupController from '../controllers/subGroup-controller';
import * as universityFetch from '../helpers/univ.api';
import * as utils from '../utils';
import { IUser, UserRole } from '../models/User';
import { IGroup } from '../models/Group';
import { ISubGroup } from '../models/SubGroup';
import config from '../../config';

enum Commands {
  SET_USER = 'SET_USER',
  CHANGE_GROUP = 'CHANGE_GROUP',
  CHANGE_SUBGROUP = 'CHANGE_SUBGROUP',
  MARK = 'MARK',
  TEST_MARK = 'TEST_MARK',
  COMMAND_TEST = 'COMMAND_TEST',
}

const vk = new VK({
  token: config.VK_API_TOKEN,
  apiLimit: config.VK_API_LIMIT,
});

const hearManager = new HearManager<MessageContext>();
vk.updates.on('message_new', hearManager.middleware);

// Мидлвеир
vk.updates.use(async (context, next) => {
  console.log('мидлвеир: ', context);

  // Коммандер для кнопок
  // if (!context.isOutbox) {
  //   const { messagePayload } = context;
  //   context.state.command =
  //     messagePayload && messagePayload.command ? messagePayload.command : null;
  //   return next();
  // }

  return next();
});

/**
 * Справка с командами
 */
hearManager.hear(/^\/help$/i, async (context) => {
  // Чек роли юзера, для старосты доп. команды
  await context.send({
    message: `Список доступных команд:
/start - запуск стартовой цепочки
/change_group ГРУППА - изменить группу
/change_subgroup - изменить группу
/delete - удалить себя из базы
/me - показать что о тебе записано в бд
/help - отобразить текущую подсказку
/test
/test_search ГРУППА - тест поиска группы
/test_user - тестовый ТЫ
/test_mark - тест callback кнопки`,
  });
});

/**
 * Стартовое сообщение
 */
hearManager.hear(/^\/start$/i, async (context) => {
  const [vkUser] = await vk.api.users.get({
    user_ids: context.senderId.toString(),
  });

  const isExist = await userController.isExist(vkUser.id);

  if (isExist) {
    await context.send({
      message: `Ты уже в базе 🙃
Для просмотра списка команд введи /help
или жди сообщения от меня с информацией о паре.`,
    });
    return;
  }

  await context.send({
    message: `Спасибо, что думаешь о своем старосте, надеюсь мы подружимся 😊
Пару слов про меня меня.
Я буду каждую пару по твоему расписанию отправлять сообщение.
Для того, чтобы отметиться - просто нажми на кнопку у сообщения ☺
У тебя будет ровно ДЕНЬ (до 23:59:59), чтобы отметиться, имей это в виду!
Теперь давай определим твою группу. Для этого введи
/set_group ГРУППА (регистр не имеет значения)
Например /set_group ист-191`,
  });
});

/**
 * Определение группы
 */
hearManager.hear(/^\/set_group (.+)$/i, async (context) => {
  const user = await userController.getByVkId(context.senderId);
  if (user) {
    await context.send({
      message: `Ты уже в базе, чтобы сменить группу введи
/change_group ГРУППА (регистр не имеет значения)`,
    });
    return;
  }

  const [, inputGroup] = context.$match;
  const groupNameRegExp = RegExp(`^${inputGroup}$`, 'i');

  const searchResponse = await universityFetch.searchByGroup(inputGroup);
  const filteredResponse = searchResponse.data.filter((el) => groupNameRegExp.test(el.label));

  if (!filteredResponse.length) {
    await context.send({ message: `Ответ неоднозначный, попробуй еще раз` });
    return;
  }

  const [group] = filteredResponse;

  let groupModel = await groupController.getById(group.id);

  if (!groupModel) {
    const subGroups = await utils.getSubGroups(group.id, group.label);
    if (!subGroups) {
      await context.send({
        message: `Что-то пошло не так, отправь команду еще раз`,
      });
      return;
    }

    const subs = await subGroupController.createMany(subGroups);
    groupModel = {
      groupId: group.id,
      groupName: group.label,
      subGroups: subs!,
    };
    groupModel = await groupController.create(groupModel);
  }

  const keyboard = Keyboard.builder();
  groupModel?.subGroups.forEach((el) => {
    keyboard.callbackButton({
      label: el.subGroupName,
      color: ButtonColor.PRIMARY,
      payload: {
        command: Commands.SET_USER,
        groupUid: groupModel?._id,
        subGroupUid: el._id,
      },
    });
  });
  keyboard.inline();

  await context.send({
    message: `Твоя группа: ${groupModel!.groupName}.
Теперь выбери подгруппу`,
    keyboard,
  });
});

/**
 * Смена группы
 */
hearManager.hear(/^\/change_group (.+)$/i, async (context) => {
  const [, inputGroup] = context.$match;
  const groupNameRegExp = RegExp(`^${inputGroup}$`, 'i');

  const searchResponse = await universityFetch.searchByGroup(inputGroup);
  const filteredResponse = searchResponse.data.filter((el) => groupNameRegExp.test(el.label));

  if (!filteredResponse.length) {
    await context.send({ message: `Ответ неоднозначный, попробуй еще раз` });
    return;
  }

  const [group] = filteredResponse;

  const user = await userController.getByVkId(context.senderId);
  if (user?.group.groupId === group.id) {
    await context.send({ message: `Ты ввел свою текущую группу, попробуй /help` });
    return;
  }

  let groupModel = await groupController.getById(group.id);

  if (!groupModel) {
    const subGroups = await utils.getSubGroups(group.id, group.label);
    if (!subGroups) {
      await context.send({
        message: `Что-то пошло не так, отправь команду еще раз`,
      });
      return;
    }

    const subs = await subGroupController.createMany(subGroups);
    groupModel = {
      groupId: group.id,
      groupName: group.label,
      subGroups: subs!,
    };
    groupModel = await groupController.create(groupModel);
  }

  const keyboard = Keyboard.builder();
  groupModel?.subGroups.forEach((el) => {
    keyboard.callbackButton({
      label: el.subGroupName,
      color: ButtonColor.PRIMARY,
      payload: {
        command: Commands.CHANGE_GROUP,
        groupUid: groupModel?._id,
        subGroupUid: el._id,
        oldSubGroupName: user?.subGroup.subGroupName,
        newSubGroupName: el.subGroupName,
      },
    });
  });
  keyboard.inline();

  await context.send({
    message: `Твоя группа: ${groupModel!.groupName}.\nТеперь выбери подгруппу:`,
    keyboard,
  });
});

/**
 * Смена подгруппы
 */
hearManager.hear(/^\/change_subgroup$/i, async (context) => {
  const user = await userController.getByVkId(context.senderId);
  if (!user) {
    await context.send({ message: `Тебя нет в базе, введи /start` });
    return;
  }

  const groupModel = await groupController.getById(user.group.groupId);

  if (groupModel && groupModel.subGroups.length < 1) {
    await context.send({ message: `У вас только одна подгруппа` });
  }

  const keyboard = Keyboard.builder();
  groupModel?.subGroups.forEach((el) => {
    if (el.subGroupId !== user.subGroup.subGroupId) {
      keyboard.callbackButton({
        label: el.subGroupName,
        color: ButtonColor.PRIMARY,
        payload: {
          command: Commands.CHANGE_SUBGROUP,
          subGroupUid: el._id,
          oldSubGroupName: user?.subGroup.subGroupName,
          newSubGroupName: el.subGroupName,
        },
      });
    }
  });
  keyboard.inline();

  await context.send({
    message: `Выбери новую подгруппу`,
    keyboard,
  });
});

/**
 * Удаление юзера из бд
 */
hearManager.hear(/^\/delete$/i, async (context) => {
  await userController.remove(context.senderId);
  await context.send({
    message: `Вы удалены из базы 😔\nНадеюсь, вы просто тестируете эту команду 😥
Чтобы начать сначала, введите /start`,
  });
});

/**
 * Инфа о юзере
 */
hearManager.hear(/^\/me$/i, async (context) => {
  const user = await userController.getByVkId(context.senderId);
  if (!user) {
    await context.send({
      message: `К сожалению, тебя нет в БД, введи /start`,
    });
    return;
  }

  await context.send({
    message: `Вот как ты записан в БД: ${JSON.stringify(user, null, '  ')}`,
  });
});

/**
 * Тест
 */
// hearManager.hear(/^\/test$/i, async (context) => {});

/**
 * Тест записи юзера в бд
 */
hearManager.hear(/^\/test_user$/i, async (context) => {
  const dbUser = await userController.getByVkId(context.senderId);

  if (dbUser) {
    await context.send({
      message: `Вот же ты в базе, дурик, что ты хочешь сделать?
${JSON.stringify(dbUser, null, '  ')}\n/help в помощь`,
    });
    return;
  }

  const subGroups: ISubGroup[] = [
    { subGroupId: 1354, subGroupName: 'ИСТ-191/1' },
    { subGroupId: 1355, subGroupName: 'ИСТ-191/2' },
  ];
  const subs = await subGroupController.createMany(subGroups);

  const group: IGroup = {
    groupId: 452,
    groupName: 'ИСТ-191',
    subGroups: subs!,
  };
  const gr = await groupController.create(group);

  const [vkUser] = await vk.api.users.get({
    user_ids: context.senderId.toString(),
  });
  const candidate: IUser = {
    userName: vkUser.first_name,
    userSurname: vkUser.last_name,
    vkId: context.senderId,
    peerId: context.peerId,
    role: UserRole.MEMBER,
    group: gr?._id,
    subGroup: subs?.find((el) => el.subGroupId === 1355)?._id,
  };
  const user = await userController.create(candidate);
  await context.send({
    message: `Успешно, вот ты: ${JSON.stringify(user, null, '  ')}`,
  });
});

/**
 * Тест редактирования сообщения
 */
hearManager.hear(/^\/test_mark$/i, async (context) => {
  if (context.conversationMessageId) {
    const replyMessageId = context.conversationMessageId + 1;
    await context.send({
      message: `${replyMessageId.toString()}`,
      keyboard: Keyboard.builder()
        .callbackButton({
          label: Commands.TEST_MARK,
          color: Keyboard.SECONDARY_COLOR,
          payload: {
            command: Commands.TEST_MARK,
          },
        })
        .inline(),
    });
    return;
  }

  await context.send({ message: `Что-то пошло не так, попробуй еще раз` });
});

/**
 * Тест поиска подгрупп по id и названию группы
 */
hearManager.hear(/^\/test_search_subgroups$/i, async (context) => {
  const res = await utils.getSubGroups(452, 'ИСТ-191');
  await context.send({ message: JSON.stringify(res, null, '  ') });
});

// Входящее сообщение юзера
// vk.updates.on('message_new', async (context) => {});

vk.updates.on('message_event', async (context) => {
  console.log('message event: ', context);

  switch (context.eventPayload.command) {
    /**
     * Запись нового юзера в бд
     */
    case Commands.SET_USER:
      {
        // Извлечь _id группы и _id подгруппы
        const { groupUid, subGroupUid } = context.eventPayload;

        const [vkUser] = await vk.api.users.get({
          user_ids: context.userId.toString(),
        });
        const candidate: IUser = {
          userName: vkUser.first_name,
          userSurname: vkUser.last_name,
          vkId: context.userId,
          peerId: context.peerId,
          role: UserRole.MEMBER,
          group: groupUid,
          subGroup: subGroupUid,
        };

        // Сохранить юзера в бд
        await userController.create(candidate);

        // Получить исходное сообщение и убрать клавиатуру
        const previousMessage = await vk.api.messages.getByConversationMessageId({
          peer_id: context.peerId,
          conversation_message_ids: context.conversationMessageId,
          group_id: context.$groupId,
        });
        const [message] = previousMessage.items;
        await vk.api.messages.edit({
          peer_id: context.peerId,
          conversation_message_id: context.conversationMessageId,
          message: message.text,
          group_id: context.$groupId,
        });

        const keyboard = Keyboard.builder()
          .callbackButton({
            label: `Отметиться`,
            color: ButtonColor.PRIMARY,
            payload: {
              command: Commands.TEST_MARK,
            },
          })
          .inline();

        await vk.api.messages.send({
          message: `Отлично, ты успешно внесен в базу 🙂
Чтобы посмотреть, как ты записан в бд, введи /me
Теперь взгяни, как будет выглядеть пример сообщения,
чтобы отметить себя, нажми кнопку "Отметиться":
Предмет: название предмета
Тип: лекция/лаба/пз
Начало: время начала пары
Конец: время конца пары`,
          peer_id: context.peerId,
          group_id: context.$groupId,
          keyboard,
          random_id: Date.now(),
        });
      }
      break;

    /**
     * Смена группы (uid группы и uid подгруппы)
     */
    case Commands.CHANGE_GROUP:
      {
        // Извлечь _id группы и _id подгруппы
        const { oldSubGroupName, newSubGroupName, groupUid, subGroupUid } = context.eventPayload;

        // Обновить группу и подгруппу
        await userController.updateGroup(context.userId, groupUid, subGroupUid);

        // Получить исходное сообщение и убрать клавиатуру
        const previousMessage = await vk.api.messages.getByConversationMessageId({
          peer_id: context.peerId,
          conversation_message_ids: context.conversationMessageId,
          group_id: context.$groupId,
        });
        const [message] = previousMessage.items;
        await vk.api.messages.edit({
          peer_id: context.peerId,
          conversation_message_id: context.conversationMessageId,
          message: message.text,
          group_id: context.$groupId,
        });

        await vk.api.messages.send({
          message: `Ты успешно сменил группу
с ${oldSubGroupName as string} на ${newSubGroupName as string}`,
          peer_id: context.peerId,
          group_id: context.$groupId,
          random_id: Date.now(),
        });
      }
      break;

    /**
     * Смена подгруппы (uid подгруппы)
     */
    case Commands.CHANGE_SUBGROUP:
      {
        // Извлечь _id группы и _id подгруппы
        const { oldSubGroupName, newSubGroupName, subGroupUid } = context.eventPayload;

        // Обновить подгруппу
        await userController.updateSubGroup(context.userId, subGroupUid);

        // Получить исходное сообщение и убрать клавиатуру
        const previousMessage = await vk.api.messages.getByConversationMessageId({
          peer_id: context.peerId,
          conversation_message_ids: context.conversationMessageId,
          group_id: context.$groupId,
        });
        const [message] = previousMessage.items;
        await vk.api.messages.edit({
          peer_id: context.peerId,
          conversation_message_id: context.conversationMessageId,
          message: message.text,
          group_id: context.$groupId,
        });

        await vk.api.messages.send({
          message: `Ты успешно сменил подгруппу
с ${oldSubGroupName as string} на ${newSubGroupName as string}`,
          peer_id: context.peerId,
          group_id: context.$groupId,
          random_id: Date.now(),
        });
      }
      break;

    /**
     * Тест редактирования сообщения
     */
    case Commands.TEST_MARK:
      {
        const previousMessage = await vk.api.messages.getByConversationMessageId({
          peer_id: context.peerId,
          conversation_message_ids: context.conversationMessageId,
          group_id: context.$groupId,
        });
        const [message] = previousMessage.items;
        await vk.api.messages.edit({
          peer_id: context.peerId,
          conversation_message_id: context.conversationMessageId,
          message: `${message.text}\nОтмечен`,
          group_id: context.$groupId,
        });
      }
      break;

    /**
     * Отметить юзера на паре
     */
    case Commands.MARK:
      break;

    default:
      break;
  }
});
// Разрешение отправки сообщений
// vk.updates.on('message_allow', (context) => console.log('message_allow: ', context));

// Вход в группу
// vk.updates.on('group_join', (context) => console.log('group_join: ', context));

export default vk;
