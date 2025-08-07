type PositionId = 0 | 2 | 4 | 5 | 6 | 16 | 23;

type Player = {
  fullName: string;
  defaultPositionId: PositionId;
  totalPoints: number;
};
