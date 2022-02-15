import * as mongoose from 'mongoose';
import UserModel, { User, UserRole } from '../models/User';

export class UserController {
  create = async (candidate: User): Promise<User> => new UserModel({ ...candidate }).save();

  isExist = async (vkId: number): Promise<boolean> => {
    const check = await UserModel.count({ vkId });
    return !!check;
  };

  getByVkId = async (vkId: number): Promise<User | null> =>
    UserModel.findOne({ vkId }).populate('group subGroup');

  getGroupLeaderByGroupId = async (groupId: number): Promise<User | null> =>
    UserModel.findOne({ groupId }).populate('group').findOne({ role: UserRole.LEADER });

  updateGroup = async (
    vkId: number,
    groupUid: mongoose.Types.ObjectId,
    subGroupUid: mongoose.Types.ObjectId,
  ): Promise<mongoose.UpdateWriteOpResult> =>
    UserModel.updateOne({ vkId }, { $set: { group: groupUid, subGroup: subGroupUid } });

  updateSubGroup = async (
    vkId: number,
    subGroupUid: mongoose.Types.ObjectId,
  ): Promise<mongoose.UpdateWriteOpResult> =>
    UserModel.updateOne({ vkId }, { $set: { subGroup: subGroupUid } });

  remove = async (vkId: number): Promise<void> => {
    await UserModel.deleteOne({ vkId });
  };
}
