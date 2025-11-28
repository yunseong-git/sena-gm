import { Types } from 'mongoose';

// Populate 된 멤버의 모양을 정의
export interface PopulatedMember {
  _id: Types.ObjectId;
  nickname: string;
  tag: string;
  fullNickName: string;
}