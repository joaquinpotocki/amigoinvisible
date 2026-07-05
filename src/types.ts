export interface Participant {
  id: string;
  name: string;
}

export interface Assignment {
  giverId: string;
  receiverId: string;
}

export interface Game {
  id: string;
  hostName: string;
  participants: Participant[];
  assignments: Assignment[];
  createdAt: string;
}
