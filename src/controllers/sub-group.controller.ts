import SubGroup, { ISubGroup } from '../models/SubGroup';

class SubGroupController {
  async createMany(subGroups: ISubGroup[]): Promise<ISubGroup[] | null> {
    const res = await SubGroup.insertMany(subGroups);
    return res;
  }

  async getManyByGroupName(groupName: string): Promise<ISubGroup[] | null> {
    const groupNameRegExp = RegExp(`^${groupName}`, 'i');
    const subGroups = await SubGroup.find({ subGroupName: groupNameRegExp });
    return subGroups;
  }
}

export default new SubGroupController();
