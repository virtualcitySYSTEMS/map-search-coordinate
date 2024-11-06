<template>
  <AbstractConfigEditor @submit="apply" v-bind="{ ...$attrs, ...$props }">
    <v-container class="py-0 px-1">
      <v-form v-model="validProjection">
        <vcs-projection v-model="inputOptions" required />
      </v-form>
      <v-row no-gutters>
        <v-col>
          <VcsFormButton
            @click="addProjectionItem"
            :disabled="!validProjection"
          >
            {{
              $t('searchCoordinate.configEditor.addProjection')
            }}</VcsFormButton
          >
        </v-col>
      </v-row>
      <VcsList
        title="searchCoordinate.configEditor.projections"
        :items="projectionItems"
      />
    </v-container>
  </AbstractConfigEditor>
</template>

<script lang="ts">
  import { VForm, VContainer, VRow, VCol } from 'vuetify/components';
  import {
    AbstractConfigEditor,
    VcsList,
    VcsFormButton,
    VcsProjection,
    VcsListItem,
    NotificationType,
    VcsUiApp,
  } from '@vcmap/ui';
  import {
    ref,
    defineComponent,
    PropType,
    Ref,
    inject,
    toRaw,
    reactive,
  } from 'vue';
  import {
    getDefaultProjection,
    Projection,
    ProjectionOptions,
    wgs84Projection,
  } from '@vcmap/core';
  import { applyDefaultProjections, PluginConfig } from './coordinateSearch.js';

  type ProjectionListItem = VcsListItem & {
    value: ProjectionOptions;
  };

  function createProjectionItem(
    projection: Projection,
    projectionItems: Ref<Array<ProjectionListItem>>,
  ): ProjectionListItem | null {
    if (projection) {
      const code = projection.proj.getCode();
      return {
        name: code,
        title: code,
        disabled:
          projection.epsg === wgs84Projection.epsg ||
          projection.epsg === getDefaultProjection().epsg,
        value: {
          epsg: projection.epsg,
          proj4: projection.proj4,
        },
        actions: [
          {
            name: 'searchCoordinate.configEditor.removeProjection',
            callback(): void {
              const idx = projectionItems.value.findIndex(
                (i) => i.name === code,
              );
              projectionItems.value.splice(idx, 1);
            },
          },
        ],
      } as ProjectionListItem;
    }
    return null;
  }

  export default defineComponent({
    name: 'CoordinateSearchEditor',
    methods: { reactive },
    components: {
      VcsProjection,
      VcsFormButton,
      VcsList,
      VForm,
      VContainer,
      VRow,
      VCol,
      AbstractConfigEditor,
    },
    props: {
      getConfig: {
        type: Function as PropType<() => PluginConfig>,
        required: true,
      },
      setConfig: {
        type: Function as PropType<(config: object | undefined) => void>,
        required: true,
      },
    },
    setup(props) {
      const app = inject<VcsUiApp>('vcsApp')!;
      const localConfig: Ref<PluginConfig> = ref(props.getConfig());
      const projectionItems: Ref<Array<ProjectionListItem>> = ref([]);
      const inputOptions: Ref<ProjectionOptions> = ref({});
      const validProjection = ref(false);

      projectionItems.value = applyDefaultProjections(
        (localConfig.value.searchProjections || []).map(
          (p) => new Projection(p),
        ),
      )
        .map((projection: Projection) => {
          return createProjectionItem(projection, projectionItems);
        })
        .filter((item) => item !== null);

      const apply = (): void => {
        props.setConfig({
          ...localConfig.value,
          searchProjections: projectionItems.value
            .map((item) => toRaw(item.value))
            .filter(
              (item) =>
                item.epsg !== wgs84Projection.epsg &&
                item.epsg !== getDefaultProjection().epsg,
            ),
        });
      };

      return {
        apply,
        inputOptions,
        projectionItems,
        validProjection,
        addProjectionItem(): void {
          const projection = new Projection(inputOptions.value);
          if (
            projectionItems.value.some((i) => i.value.epsg === projection.epsg)
          ) {
            app.notifier.add({
              message: app.vueI18n.t('searchCoordinate.configEditor.existing'),
              type: NotificationType.WARNING,
            });
            return;
          }
          const projectionItem = createProjectionItem(
            projection,
            projectionItems,
          );
          if (projectionItem) {
            projectionItems.value.push(projectionItem);
          } else {
            app.notifier.add({
              message: app.vueI18n.t(
                'searchCoordinate.configEditor.invalidInput',
              ),
              type: NotificationType.ERROR,
            });
          }
        },
      };
    },
  });
</script>
<style scoped></style>
