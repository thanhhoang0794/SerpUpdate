import { Accordion, HStack } from '@chakra-ui/react'
import { forwardRef } from 'react'
import { LuChevronDown } from 'react-icons/lu'

interface AccordionItemProps extends Accordion.ItemProps {
  children?: React.ReactNode;
  value: string;
}

interface AccordionItemTriggerProps extends Accordion.ItemTriggerProps {
  children?: React.ReactNode;
  indicatorPlacement?: 'start' | 'end' | 'none';
  backgroundColor?: string;
  paddingX?: number;
  paddingY?: number;
  width?: string;
}

export const AccordionItemTrigger = forwardRef<HTMLButtonElement, AccordionItemTriggerProps>(
  function AccordionItemTrigger(props, ref) {
    const { children, indicatorPlacement = 'end', ...rest } = props
    return (
      <Accordion.ItemTrigger {...rest} ref={ref}>
        {indicatorPlacement === 'start' && (
          <Accordion.ItemIndicator rotate={{ base: '-90deg', _open: '0deg' }}>
            <LuChevronDown />
          </Accordion.ItemIndicator>
        )}
        <HStack gap="4" flex="1" textAlign="start" justifyContent={'space-between'} width="full">
          {children}
        </HStack>
        {indicatorPlacement === 'end' && (
          <Accordion.ItemIndicator>
            <LuChevronDown />
          </Accordion.ItemIndicator>
        )}
      </Accordion.ItemTrigger>
    )
  }
)

interface AccordionItemContentProps extends Accordion.ItemContentProps {
  children?: React.ReactNode;
  paddingY?: number;
  paddingX?: number;
}

export const AccordionItemContent = forwardRef<HTMLDivElement, AccordionItemContentProps>(
  function AccordionItemContent(props, ref) {
    return (
      <Accordion.ItemContent>
        <Accordion.ItemBody {...props} ref={ref} />
      </Accordion.ItemContent>
    )
  }
)

export const AccordionRoot = Accordion.Root
export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>((props, ref) => (
  <Accordion.Item {...props} ref={ref} />
))
