export type ShippingMethod = {
  id: number;
  name: string;
};

export type API = {
  get: (path: string) => Promise<Response>;
  post: (path: string, body: unknown) => Promise<Response>;
};
