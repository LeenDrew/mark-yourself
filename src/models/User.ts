import * as mongoose from 'mongoose';

export enum UserRole {
  MEMBER = 'member',
  LEADER = 'leader',
}

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  userName: string; // Имя, берется из вк
  userSurname: string; // Фамилия, берется из вк
  vkId: number; // id вк, берется из вк
  peerId: number; // id беседы, берется из вк
  role: UserRole; // Участник/староста, устанавливается вручную, по умолчанию member
  group: any; // _id Group Model
  subGroup: any; // _id SubGroup Model
}

const schema = new mongoose.Schema<IUser>({
  userName: { type: String, required: true },
  userSurname: { type: String, required: true },
  vkId: { type: Number, required: true, unique: true },
  peerId: { type: Number, required: true, unique: true },
  role: { type: String, enum: Object.values(UserRole), required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  subGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'SubGroup', required: true },
});

export default mongoose.model<IUser>('User', schema);
