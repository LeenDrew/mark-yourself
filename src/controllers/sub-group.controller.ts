import SubGroup, { ISubGroup } from '../models/SubGroup';

export class SubGroupController {
  async createMany(subGroups: ISubGroup[]): Promise<ISubGroup[]> {
    const res = await SubGroup.insertMany(subGroups);
    return res;
  }

  async getManyByGroupName(groupName: string): Promise<ISubGroup[] | []> {
    const groupNameRegExp = RegExp(`^${groupName}`, 'i');
    const subGroups = await SubGroup.find({ subGroupName: groupNameRegExp });
    return subGroups;
  }
}
