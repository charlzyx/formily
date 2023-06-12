import React, { useRef } from 'react'
import { ArrayField } from '@formily/core'
import {
  useField,
  observer,
  useFieldSchema,
  RecursionField,
} from '@formily/react'
import cls from 'classnames'

import { ISchema } from '@formily/json-schema'
import { usePrefixCls } from '../__builtins__'
import { ArrayBase, ArrayBaseMixins, IArrayBaseProps } from '../array-base'
import { DndProvider, SortableItem } from '../array-base/DndKitSortable'
import { DragEndEvent } from '@dnd-kit/core'
type ComposedArrayItems = React.FC<
  React.PropsWithChildren<
    React.HTMLAttributes<HTMLDivElement> & IArrayBaseProps
  >
> &
  ArrayBaseMixins & {
    Item?: React.FC<
      React.HTMLAttributes<HTMLDivElement> & {
        type?: 'card' | 'divide'
      }
    >
  }

const isAdditionComponent = (schema: ISchema) => {
  return schema['x-component']?.indexOf('Addition') > -1
}

const useAddition = () => {
  const schema = useFieldSchema()
  return schema.reduceProperties((addition, schema, key) => {
    if (isAdditionComponent(schema)) {
      return <RecursionField schema={schema} name={key} />
    }
    return addition
  }, null)
}

export const ArrayItems: ComposedArrayItems = observer((props) => {
  const field = useField<ArrayField>()
  const ref = useRef<HTMLDivElement>()
  const prefixCls = usePrefixCls('formily-array-items')
  const schema = useFieldSchema()
  const addition = useAddition()
  const { onAdd, onCopy, onRemove, onMoveDown, onMoveUp } = props
  const dataSource = Array.isArray(field.value) ? field.value : []

  const keyList = dataSource.map((_, i) => i.toString())

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      field.move(active.id as number, over.id as number)
    }
  }

  return (
    <ArrayBase
      onAdd={onAdd}
      onCopy={onCopy}
      onRemove={onRemove}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
    >
      <div
        {...props}
        ref={ref}
        onChange={() => {}}
        className={cls(prefixCls, props.className)}
      >
        <DndProvider
          container={ref.current}
          keyList={keyList}
          onDragEnd={onDragEnd}
        >
          {dataSource?.map((item, index) => {
            const items = Array.isArray(schema.items)
              ? schema.items[index] || schema.items[0]
              : schema.items
            return (
              <ArrayBase.Item
                key={index}
                index={index}
                record={() => field.value?.[index]}
              >
                <SortableItem
                  wrapper="div"
                  className={`${prefixCls}-item`}
                  key={`item-${index}`}
                  rowKey={index}
                >
                  <div className={`${prefixCls}-item-inner`}>
                    <RecursionField schema={items} name={index} />
                  </div>
                </SortableItem>
              </ArrayBase.Item>
            )
          })}
        </DndProvider>
        {addition}
      </div>
    </ArrayBase>
  )
})

ArrayItems.displayName = 'ArrayItems'

ArrayItems.Item = (props) => {
  const prefixCls = usePrefixCls('formily-array-items')
  return (
    <div
      {...props}
      onChange={() => {}}
      className={cls(`${prefixCls}-${props.type || 'card'}`, props.className)}
    >
      {props.children}
    </div>
  )
}

ArrayBase.mixin(ArrayItems)

export default ArrayItems
