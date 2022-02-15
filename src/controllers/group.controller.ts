import GroupModel, { Group } from '../models/Group';

export class GroupController {
  create = async (group: Group): Promise<Group> => new GroupModel({ ...group }).save();

  getById = async (groupId: number): Promise<Group | null> =>
    GroupModel.findOne({ groupId }).populate('subGroups');
}
