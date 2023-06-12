import React, { Fragment, ReactElement, useEffect, useMemo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { DndContext } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortHandleContext } from '../array-base'

export const SortableTableRow = (props: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.rowIndex,
  })

  const itemStyle: React.CSSProperties = {
    position: 'relative',
    touchAction: 'none',
    transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
    transition: `${transform ? 'all 200ms ease' : ''}`,
  }
  const dragStyle = {
    transition,
    opacity: '0.8',
    transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
  }

  const computedStyle = isDragging
    ? {
        ...itemStyle,
        ...dragStyle,
        ...props.style,
      }
    : {
        ...itemStyle,
        ...props.style,
      }

  const child = useMemo(
    () =>
      React.cloneElement(props.children as React.ReactElement, {
        ...props.children.props,
        id: props.rowIndex,
        ...listeners,
        style: computedStyle,
        ...attributes,
      }),
    []
  )

  useEffect(() => {
    setNodeRef(props?.container?.querySelector('tr'))
  }, [])

  return (
    <SortHandleContext.Provider value={listeners}>
      {child}
    </SortHandleContext.Provider>
  )
}

export const SortableItem = (
  props: React.PropsWithChildren<{
    wrapper?: 'div' | 'tr'
    style?: React.CSSProperties
    className?: string
    rowKey?: number
  }>
) => {
  const { wrapper, style, children, rowKey, ...rest } = props

  const id = useMemo(
    () => (props['data-row-key'] || rowKey || '0').toString(),
    [props]
  )
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  })

  const itemStyle: React.CSSProperties = {
    position: 'relative',
    touchAction: 'none',
    transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
    transition: `${transform ? 'all 200ms ease' : ''}`,
  }
  const dragStyle = {
    transition,
    opacity: '0.8',
    transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
  }

  const computedStyle = isDragging
    ? {
        ...style,
        ...itemStyle,
        ...dragStyle,
        ...props.style,
      }
    : {
        ...style,
        ...itemStyle,
        ...props.style,
      }

  const Comp = useMemo(() => {
    return wrapper === 'div' ? 'div' : 'tr'
  }, [])

  return (
    <Comp
      id={id}
      ref={setNodeRef}
      {...attributes}
      style={computedStyle}
      {...rest}
      data-cypress="draggable-item"
    >
      <SortHandleContext.Provider value={listeners}>
        {children}
      </SortHandleContext.Provider>
    </Comp>
  )
}

export const DndProvider = React.memo(
  (
    props: React.PropsWithChildren<{
      keyList: React.Key[]
      onDragEnd: (event: DragEndEvent) => void
      container?: HTMLElement
    }>
  ) => {
    return (
      <DndContext
        // https://github.com/clauderic/dnd-kit/issues/899#issuecomment-1264700799
        accessibility={{ container: props.container || document.body }}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={props.onDragEnd}
      >
        <SortableContext
          items={props.keyList}
          strategy={verticalListSortingStrategy}
        >
          {props.children}
        </SortableContext>
      </DndContext>
    )
  }
)
