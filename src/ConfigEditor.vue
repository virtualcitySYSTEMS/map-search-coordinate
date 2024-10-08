<template>
  <AbstractConfigEditor @submit="apply" v-bind="{ ...$attrs, ...$props }">
    <v-container class="py-0 px-1">
      <v-row no-gutters>
        <v-col>
          <VcsLabel html-for="epsg"> epsg </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField id="epsg" clearable v-model.trim="inputOptions.epsg" />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col>
          <VcsLabel html-for="proj4"> proj4 </VcsLabel>
        </v-col>
        <v-col>
          <VcsTextField
            id="proj4"
            clearable
            v-model.trim="inputOptions.proj4"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col>
          <VcsFormButton @click="addProjectionItem">
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
  import { VContainer, VRow, VCol } from 'vuetify/components';
  import {
    VcsLabel,
    VcsTextField,
    AbstractConfigEditor,
    VcsList,
    VcsFormButton,
    VcsListItem,
    NotificationType,
    VcsUiApp,
  } from '@vcmap/ui';
  import { ref, defineComponent, PropType, Ref, inject } from 'vue';
  import { Projection, ProjectionOptions } from '@vcmap/core';
  import { PluginConfig } from './coordinateSearch.js';

  type ProjectionListItem = VcsListItem & {
    value: ProjectionOptions;
  };

  function createProjectionItem(
    options: ProjectionOptions,
    projectionItems: Ref<Array<ProjectionListItem>>,
  ): ProjectionListItem | null {
    if (Projection.validateOptions(options)) {
      const projection = new Projection(options);
      const code = projection.proj.getCode();
      return {
        name: code,
        title: code,
        value: {
          epsg: options.epsg,
          proj4: options.proj4,
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
    title: 'Coordinate Search Editor',
    components: {
      VcsFormButton,
      VcsList,
      VContainer,
      VRow,
      VCol,
      AbstractConfigEditor,
      VcsLabel,
      VcsTextField,
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
      const localConfig: Ref<PluginConfig> = ref({} as PluginConfig);
      const projectionItems: Ref<Array<ProjectionListItem>> = ref([]);
      const inputOptions: Ref<ProjectionOptions> = ref({});

      const config = props.getConfig();
      Object.assign(localConfig.value, config);
      if (localConfig.value.searchProjections) {
        projectionItems.value = localConfig.value.searchProjections
          .map((options: ProjectionOptions) => {
            return createProjectionItem(options, projectionItems);
          })
          .filter((item) => item !== null);
      }

      const apply = (): void => {
        props.setConfig({
          searchProjections: projectionItems.value.map((item) => item.value),
        });
      };

      return {
        apply,
        localConfig,
        inputOptions,
        projectionItems,
        addProjectionItem(): void {
          const projectionItem = createProjectionItem(
            inputOptions.value,
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
