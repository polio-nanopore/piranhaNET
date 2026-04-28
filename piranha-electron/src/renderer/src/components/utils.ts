import { z, type ZodString } from "zod";
import { m } from "../../../paraglide/messages";

export const requiredString = (): ZodString =>
  z.string().nonempty(m.formsErrorRequiredValue());
