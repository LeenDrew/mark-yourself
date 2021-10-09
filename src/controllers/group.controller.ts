import Group, { IGroup } from '../models/Group';

class GroupController {
  async create(group: IGroup): Promise<IGroup | null> {
    const newGroup = new Group({ ...group });
    const res = await newGroup.save();
    return res;
  }

  async getById(groupId: number): Promise<IGroup | null> {
    const group = await Group.findOne({ groupId }).populate('subGroups');
    return group;
  }
}

export default new GroupController();
