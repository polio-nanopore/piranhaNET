<script lang="ts">
  import {z} from "zod";
  import {superForm, defaults} from "sveltekit-superforms";
  import {zod} from "sveltekit-superforms/adapters";

  const formSchema = z.object({
    name: z.string().nonempty(),
    barcodesFile: z.string().nonempty(),
    minKnowFolder: z.string().nonempty(),
    notes: z.string().optional(),
    analysisThreads: z.number().min(1).max(20)
  });

  let enableRun = $state(false);

  const form = superForm(defaults(zod(formSchema)), {
    SPA: true, // we're using superforms without SvelteKit,
    validators: zod(formSchema),
    onUpdate({form}) {
      enableRun = form.valid
    }
  });
</script>
