import { VK, Keyboard, MessageContext, ButtonColor } from 'vk-io';
import { HearManager } from '@vk-io/hear';
import { UserController } from '../controllers/user.controller';
import { GroupController } from '../controllers/group.controller';
import { SubGroupController } from '../controllers/subgroup.controller';
import * as universityFetch from '../helpers/univ.api';
import * as utils from '../utils';
import { User, UserRole } from '../models/User';
import { Group } from '../models/Group';
import { SubGroup } from '../models/SubGroup';
import { config } from '../config';

enum Commands {
  ADD_USER = 'ADD_USER',
  CHANGE_GROUP = 'CHANGE_GROUP',
  CHANGE_SUBGROUP = 'CHANGE_SUBGROUP',
  MARK = 'MARK',
  TEST_MARK = 'TEST_MARK',
}

export const vk = new VK({
  token: config.VK_API_TOKEN,
  apiLimit: config.VK_API_LIMIT,
});

const userController = new UserController();
const groupController = new GroupController();
const subGroupController = new SubGroupController();

const hearManager = new HearManager<MessageContext>();
vk.updates.on('message_new', hearManager.middleware);

hearManager.hear(/^\/help$/i, async (context) => {
  // Чек роли юзера, для старосты доп. команды

  await context.send({
    message: `Список доступных команд:
    /start - запуск стартовой цепочки
    /change_group ГРУППА - изменить группу
    /change_subgroup - изменить подгруппу
    /delete - удалить себя из базы
    /me - показать что о тебе записано в бд

    /help - отобразить текущую подсказку
    /test_user - тестовый ТЫ
    /test_search ГРУППА - тест поиска группы
    /test_search_subgroup ГРУППА - тест поиска подгрупп для группы
    /test_mark - тест callback кнопки`,
  });
});

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

    const createdSubGroups = await subGroupController.createMany(subGroups);
    groupModel = {
      groupId: group.id,
      groupName: group.label,
      subGroups: createdSubGroups,
    };
    groupModel = await groupController.create(groupModel);
  }

  const keyboard = Keyboard.builder();
  groupModel.subGroups.forEach((el) => {
    keyboard.callbackButton({
      label: el.subGroupName,
      color: ButtonColor.PRIMARY,
      payload: {
        command: Commands.ADD_USER,
        groupUid: groupModel._id,
        subGroupUid: el._id,
      },
    });
  });
  keyboard.inline();

  await context.send({
    message: `Твоя группа: ${groupModel.groupName}.
    Теперь выбери подгруппу`,
    keyboard,
  });
});

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
  if (user.group.groupId === group.id) {
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

    const createdSubGroups = await subGroupController.createMany(subGroups);
    groupModel = {
      groupId: group.id,
      groupName: group.label,
      subGroups: createdSubGroups,
    };
    groupModel = await groupController.create(groupModel);
  }

  const keyboard = Keyboard.builder();
  groupModel.subGroups.forEach((el) => {
    keyboard.callbackButton({
      label: el.subGroupName,
      color: ButtonColor.PRIMARY,
      payload: {
        command: Commands.CHANGE_GROUP,
        groupUid: groupModel._id,
        subGroupUid: el._id,
        oldSubGroupName: user.subGroup.subGroupName,
        newSubGroupName: el.subGroupName,
      },
    });
  });
  keyboard.inline();

  await context.send({
    message: `Твоя группа: ${groupModel.groupName}.\nТеперь выбери подгруппу:`,
    keyboard,
  });
});

hearManager.hear(/^\/change_subgroup$/i, async (context) => {
  const user = await userController.getByVkId(context.senderId);
  if (!user) {
    await context.send({ message: `Тебя нет в базе, введи /start` });
    return;
  }

  const group = await groupController.getById(user.group.groupId);

  if (group && group.subGroups.length < 1) {
    await context.send({ message: `У вас только одна подгруппа` });
    return;
  }

  const keyboard = Keyboard.builder();
  group.subGroups.forEach((el) => {
    if (el.subGroupId !== user.subGroup.subGroupId) {
      keyboard.callbackButton({
        label: el.subGroupName,
        color: ButtonColor.PRIMARY,
        payload: {
          command: Commands.CHANGE_SUBGROUP,
          subGroupUid: el._id,
          oldSubGroupName: user.subGroup.subGroupName,
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

hearManager.hear(/^\/delete$/i, async (context) => {
  await userController.remove(context.senderId);
  await context.send({
    message: `Вы удалены из базы 😔\nНадеюсь, вы просто тестируете эту команду 😥
    Чтобы начать сначала, введите /start`,
  });
});

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

hearManager.hear(/^\/test_user$/i, async (context) => {
  const user = await userController.getByVkId(context.senderId);

  if (user) {
    await context.send({
      message: `Вот же ты в базе, дурик, что ты хочешь сделать?
      ${JSON.stringify(user, null, '  ')}\n/help в помощь`,
    });
    return;
  }

  const subGroups: SubGroup[] = [
    { subGroupId: 1354, subGroupName: 'ИСТ-191/1' },
    { subGroupId: 1355, subGroupName: 'ИСТ-191/2' },
  ];
  const createdSubGroups = await subGroupController.createMany(subGroups);

  // Вместо описывания, создавать прокидывая значения и получать готовый
  const group: Group = {
    groupId: 452,
    groupName: 'ИСТ-191',
    subGroups: createdSubGroups,
  };
  const createdGroup = await groupController.create(group);

  const [vkUser] = await vk.api.users.get({
    user_ids: context.senderId.toString(),
  });
  const candidate: User = {
    userName: vkUser.first_name,
    userSurname: vkUser.last_name,
    vkId: context.senderId,
    peerId: context.peerId,
    role: UserRole.MEMBER,
    group: createdGroup._id,
    subGroup: createdSubGroups.find((el) => el.subGroupId === 1355)._id,
  };
  const createdUser = await userController.create(candidate);
  await context.send({
    message: `Успешно, вот ты: ${JSON.stringify(createdUser, null, '  ')}`,
  });
});

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

hearManager.hear(/^\/test_search_group (.+)$/i, async (context) => {
  const [, inputGroup] = context.$match;
  const groupNameRegExp = RegExp(`^${inputGroup}$`, 'i');
  const searchResponse = await universityFetch.searchByGroup(inputGroup);
  const filteredResponse = searchResponse.data.filter((el) => groupNameRegExp.test(el.label));

  if (!filteredResponse.length) {
    await context.send({ message: `Ответ неоднозначный, попробуй еще раз` });
    return;
  }

  const [group] = filteredResponse;
  // const res = await utils.getSubGroups(452, 'ИСТ-191');
  await context.send({ message: JSON.stringify(group, null, '  ') });
});

hearManager.hear(/^\/test_search_subgroup (.+)$/i, async (context) => {
  const [, inputGroup] = context.$match;
  const groupNameRegExp = RegExp(`^${inputGroup}$`, 'i');
  const searchResponse = await universityFetch.searchByGroup(inputGroup);
  const filteredResponse = searchResponse.data.filter((el) => groupNameRegExp.test(el.label));

  if (!filteredResponse.length) {
    await context.send({ message: `Ответ неоднозначный, попробуй еще раз` });
    return;
  }

  const [group] = filteredResponse;

  const subGroups = await utils.getSubGroups(group.id, group.label);
  if (!subGroups) {
    await context.send({
      message: `Что-то пошло не так, отправь команду еще раз`,
    });
    return;
  }

  await context.send({
    message: `Список подгрупп для группы ${inputGroup}:
    ${JSON.stringify(subGroups, null, ' ')}`,
  });
});

vk.updates.on('message_event', async (context) => {
  console.log('message event: ', context);

  switch (context.eventPayload.command) {
    case Commands.ADD_USER:
      {
        const { groupUid, subGroupUid } = context.eventPayload;

        const [vkUser] = await vk.api.users.get({
          user_ids: context.userId.toString(),
        });
        const candidate: User = {
          userName: vkUser.first_name,
          userSurname: vkUser.last_name,
          vkId: context.userId,
          peerId: context.peerId,
          role: UserRole.MEMBER,
          group: groupUid,
          subGroup: subGroupUid,
        };

        await userController.create(candidate);

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

    case Commands.CHANGE_GROUP:
      {
        const { oldSubGroupName, newSubGroupName, groupUid, subGroupUid } = context.eventPayload;

        await userController.updateGroup(context.userId, groupUid, subGroupUid);

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
          message: `Ты успешно сменил группу с ${oldSubGroupName as string} на
          ${newSubGroupName as string}`,
          peer_id: context.peerId,
          group_id: context.$groupId,
          random_id: Date.now(),
        });
      }
      break;

    case Commands.CHANGE_SUBGROUP:
      {
        const { oldSubGroupName, newSubGroupName, subGroupUid } = context.eventPayload;

        await userController.updateSubGroup(context.userId, subGroupUid);

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
          message: `Ты успешно сменил подгруппу с ${oldSubGroupName as string} на
          ${newSubGroupName as string}`,
          peer_id: context.peerId,
          group_id: context.$groupId,
          random_id: Date.now(),
        });
      }
      break;

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

    case Commands.MARK:
      break;

    default:
      break;
  }
});
