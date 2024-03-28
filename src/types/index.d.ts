declare type RegisterParams = {
  userId: string;
  email: string;
  password: string;
};

declare type LoginParams = {
  email: string;
  password: string;
};

declare type GetCustomerParams = {
  page: number;
  limit: number;
};

declare type GetServiceParams = {
  page: number;
  limit: number;
};
