import * as mongoose from 'mongoose';

export interface IGroup {
  _id?: mongoose.Types.ObjectId;
  groupId: number; // id
  groupName: string; // Название
  subGroups: any[]; // _id[] SubGroup Model
}

const schema = new mongoose.Schema<IGroup>({
  groupId: { type: Number, required: true },
  groupName: { type: String, required: true },
  subGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubGroup', required: true }],
});

export default mongoose.model<IGroup>('Group', schema);
