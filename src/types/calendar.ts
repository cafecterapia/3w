export type Slot = {
  id: string;
  start: Date;
  end: Date;
  taken?: boolean;
};

export type CreditPack = { 
  total: number; 
  used: number; 
};

export type View = 'month' | 'week' | 'day';
