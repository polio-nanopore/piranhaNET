<script lang="ts">
  import {useTinyRouter} from "svelte-tiny-router";

  const router = useTinyRouter();
  const navigate = (route: string) => {
    router.navigate(route);
  };

  navigate("/run");
</script>

<nav>
  <button onclick={() => navigate('/run')}>Run</button>
  <button onclick={() => navigate('/about')}>About</button>
</nav>
