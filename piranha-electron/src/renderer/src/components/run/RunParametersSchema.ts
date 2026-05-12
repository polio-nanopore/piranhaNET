import { z, type ZodString } from "zod";
import { m } from "../../../../paraglide/messages";

const THREADS_MIN = 1;
const THREADS_MAX = 20;

const requiredString = (): ZodString =>
  z.string().nonempty(m.formsErrorRequiredValue());
const threadsRangeError = m.formsErrorRange({
  min: THREADS_MIN,
  max: THREADS_MAX,
});

export default z.object({
  name: requiredString(),
  barcodesFilePath: requiredString(),
  minKnowFolderPath: requiredString(),
  outputFolderPath: requiredString(),
  notes: requiredString(),
  threads: z
    .int(m.formsErrorNumberRequired())
    .min(THREADS_MIN, { error: threadsRangeError })
    .max(THREADS_MAX, { error: threadsRangeError }),
});
