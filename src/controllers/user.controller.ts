import * as mongoose from 'mongoose';
import UserModel, { User, UserRole } from '../models/User';

export class UserController {
  create = async (candidate: User): Promise<User> => {
    const user = new UserModel({ ...candidate });
    const res = await user.save();
    return res;
  };

  isExist = async (vkId: number): Promise<boolean> => {
    const check = await UserModel.count({ vkId });
    if (check) return true;
    return false;
  };

  getByVkId = async (vkId: number): Promise<User | null> => {
    const user = await UserModel.findOne({ vkId }).populate('group subGroup');
    return user;
  };

  getGroupLeaderByGroupId = async (groupId: number): Promise<User | null> => {
    const user = await UserModel.findOne({ groupId })
      .populate('group')
      .findOne({ role: UserRole.LEADER });
    return user;
  };

  updateGroup = async (
    vkId: number,
    groupUid: mongoose.Types.ObjectId,
    subGroupUid: mongoose.Types.ObjectId,
  ): Promise<mongoose.UpdateWriteOpResult> => {
    const res = await UserModel.updateOne(
      { vkId },
      { $set: { group: groupUid, subGroup: subGroupUid } },
    );
    return res;
  };

  updateSubGroup = async (
    vkId: number,
    subGroupUid: mongoose.Types.ObjectId,
  ): Promise<mongoose.UpdateWriteOpResult> => {
    const res = await UserModel.updateOne({ vkId }, { $set: { subGroup: subGroupUid } });
    return res;
  };

  remove = async (vkId: number): Promise<void> => {
    await UserModel.deleteOne({ vkId });
  };
}
