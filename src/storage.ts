import { createDirectus } from "@directus/sdk";
import { rest } from "@directus/sdk/rest";

const sdk = createDirectus("http://0.0.0.0:8055").with(rest());

export default sdk;
