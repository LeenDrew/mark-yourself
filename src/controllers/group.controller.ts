import GroupModel, { Group } from '../models/Group';

export class GroupController {
  create = async (group: Group): Promise<Group> => {
    const newGroup = new GroupModel({ ...group });
    const res = await newGroup.save();
    return res;
  };

  getById = async (groupId: number): Promise<Group | null> => {
    const group = await GroupModel.findOne({ groupId }).populate('subGroups');
    return group;
  };
}
