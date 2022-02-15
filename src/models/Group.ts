import * as mongoose from 'mongoose';

export interface Group {
  _id?: mongoose.Types.ObjectId;
  groupId: number; // id
  groupName: string; // Название
  subGroups: any[]; // _id[] SubGroup Model
}

const schema = new mongoose.Schema<Group>({
  groupId: { type: Number, required: true },
  groupName: { type: String, required: true },
  subGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubGroup', required: true }],
});

export default mongoose.model<Group>('Group', schema);
