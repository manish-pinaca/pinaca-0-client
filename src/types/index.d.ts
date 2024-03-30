declare type RegisterParams = {
  userName: string;
  email: string;
  password: string;
};

declare type LoginParams = {
  email: string;
  password: string;
  role: "admin" | "customer";
};

declare type GetCustomerParams = {
  page: number;
  limit: number;
};

declare type GetServiceParams = {
  page: number;
  limit: number;
};
