export interface Box {
    uuid: string;
    name: string;
    description: string;
    enabled: boolean;
    owner: string;
}

export interface Letter {
    uuid: string;
    boxUUID: string;
    content: string;
    remark: string;
    isRead: boolean;
    createDate: number;
}