<template>
  <BalloonComponent v-bind="{ ...$attrs }">
    <template #default="{ attrs }">
      <v-row no-gutters>
        <v-col cols="2" class="d-flex justify-center align-center">
          <v-icon size="20"> $vcsHomePoint </v-icon>
        </v-col>
        <v-col cols="10">
          <VcsLabel class="py-0 vcs-position-display">
            {{ $t('searchCoordinate.balloon.geographic') }} (WGS84)
          </VcsLabel>
          <VcsLabel class="py-0 vcs-position-display vcs-position-value">
            {{
              `Lat: ${attrs.attributes.pointWGS84[0]} &nbsp; Lon: ${attrs.attributes.pointWGS84[1]}`
            }}
          </VcsLabel>
          <VcsLabel class="py-0 vcs-position-display">
            {{ $t('searchCoordinate.balloon.projected') }}
            ({{ attrs.attributes.epsg }})
          </VcsLabel>
          <v-row no-gutters>
            <VcsFormattedNumber
              class="py-0 vcs-position-display vcs-position-value"
              prefix="x:"
              :model-value="attrs.attributes.pointProjected[0]"
              :number-format-options="{ useGrouping: false }"
            />
            <VcsFormattedNumber
              class="py-0 pl-2 vcs-position-display vcs-position-value"
              prefix="y:"
              :model-value="attrs.attributes.pointProjected[1]"
              :number-format-options="{ useGrouping: false }"
            />
          </v-row>
          <v-row no-gutters class="pt-2">
            <VcsFormButton
              v-if="attrs.attributes.isWGS84Input"
              @click="swapValue"
              >{{ $t('searchCoordinate.balloon.swapLonLat') }}
            </VcsFormButton>
          </v-row>
        </v-col>
      </v-row>
    </template>
  </BalloonComponent>
</template>

<script lang="ts">
  import { VCol, VIcon, VRow } from 'vuetify/components';
  import {
    BalloonComponent,
    VcsFormButton,
    VcsFormattedNumber,
    VcsLabel,
    VcsUiApp,
  } from '@vcmap/ui';
  import { defineComponent, inject } from 'vue';
  import { mercatorProjection, Projection, wgs84Projection } from '@vcmap/core';
  import { Coordinate } from 'ol/coordinate';

  /**
   * @description A balloon viewing coordinate information
   */
  export default defineComponent({
    name: 'CoordinateBalloonComponent',
    components: {
      VcsFormButton,
      VcsFormattedNumber,
      VcsLabel,
      BalloonComponent,
      VCol,
      VIcon,
      VRow,
    },
    setup(_, { attrs }) {
      const app = inject('vcsApp') as VcsUiApp;
      const wgs84Position = Projection.transform(
        wgs84Projection,
        mercatorProjection,
        attrs.position as Coordinate,
      );
      return {
        swapValue(): void {
          const title = app.vueI18n.t('searchCoordinate.balloon.title');
          app.search
            .search(wgs84Position.slice(0, 2).reverse().join(', '))
            .then((results) => {
              if (results.length > 0) {
                results
                  .find((r) => r.title.includes(title))
                  .clicked?.()
                  .catch(() => {});
              }
            })
            .catch(() => {});
        },
      };
    },
  });
</script>
<style lang="scss" scoped>
  .vcs-position-display {
    height: calc(var(--v-vcs-font-size) * 2 - 4px);
    &.vcs-position-value {
      color: rgb(var(--v-theme-base-darken-2));
    }
  }
</style>
