<script setup>
// One pulsing placeholder block. Loading states are built by arranging these in
// the shape of the content that is coming, so the page does not jump when the
// real data lands — see docs/DESIGN.md.
//
// Size and radius come from the caller: <SkeletonBlock class="h-4 w-24" />
</script>

<template>
  <div class="animate-pulse rounded-md bg-app-tile"></div>
</template>
