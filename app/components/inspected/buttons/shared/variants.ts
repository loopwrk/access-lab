import type { ComponentVariant } from '~/types/component'
import type { ButtonRenderAs } from './types'

type ButtonVariant = ComponentVariant & { key: ButtonRenderAs }

const ALL_VARIANTS: Record<ButtonRenderAs, ButtonVariant> = {
  'button-button': {
    key: 'button-button',
    label: '<button type="button">',
    description: 'components.button.variants.button-button.description',
    status: 'recommended',
    statusNote: 'components.button.variants.button-button.statusNote',
    section: '<button> Element',
    seeAlsoTopicId: 'button-types'
  },
  'button': {
    key: 'button',
    label: '<button>',
    description: 'components.button.variants.button.description',
    status: 'avoid',
    statusNote: 'components.button.variants.button.statusNote',
    section: '<button> Element',
    seeAlsoTopicId: 'button-types'
  },
  'button-submit': {
    key: 'button-submit',
    label: '<button type="submit">',
    description: 'components.button.variants.button-submit.description',
    status: 'info',
    statusNote: 'components.button.variants.button-submit.statusNote',
    section: '<button> Element',
    seeAlsoTopicId: 'button-types'
  },
  'button-reset': {
    key: 'button-reset',
    label: '<button type="reset">',
    description: 'components.button.variants.button-reset.description',
    status: 'rare',
    statusNote: 'components.button.variants.button-reset.statusNote',
    section: '<button> Element',
    seeAlsoTopicId: 'button-types'
  },
  'input-submit': {
    key: 'input-submit',
    label: '<input type="submit">',
    description: 'components.button.variants.input-submit.description',
    status: 'neutral',
    statusNote: 'components.button.variants.input-submit.statusNote',
    section: '<input> Alternative'
  },
  'input-button': {
    key: 'input-button',
    label: '<input type="button">',
    description: 'components.button.variants.input-button.description',
    status: 'avoid',
    statusNote: 'components.button.variants.input-button.statusNote',
    section: '<input> Alternative',
    seeAlsoTopicId: 'button-types'
  },
  'input-reset': {
    key: 'input-reset',
    label: '<input type="reset">',
    description: 'components.button.variants.input-reset.description',
    status: 'rare',
    statusNote: 'components.button.variants.input-reset.statusNote',
    section: '<input> Alternative',
    seeAlsoTopicId: 'button-types'
  },
  'input-image': {
    key: 'input-image',
    label: '<input type="image">',
    description: 'components.button.variants.input-image.description',
    status: 'neutral',
    statusNote: 'components.button.variants.input-image.statusNote',
    section: '<input> Alternative',
    seeAlsoTopicId: 'button-types'
  }
}

export function variants(keys: ButtonRenderAs[]): ButtonVariant[] {
  return keys.map(k => ALL_VARIANTS[k])
}
