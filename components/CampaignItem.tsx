'use client'

import { HStack, Table, Image, Text, Center, Spacer, Box } from '@chakra-ui/react'
import { Link as ChakraLink } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { FaDesktop, FaMobile, FaYahoo, FaGoogle } from 'react-icons/fa'
import { Campaign, SharedCampaign } from '@/app/types/campaigns'
import { deviceType } from '@/app/types/deviceType'
import ItemActionMenu from './ItemActionMenu'
import { usePathname } from 'next/navigation'
import { routes } from '@/utils/constant'
import { SearchEngine } from '@/app/types/enumSearchEngine'
import { BiLogoBing } from 'react-icons/bi'
import { AiOutlineBaidu } from 'react-icons/ai'
import { SiNaver } from 'react-icons/si'
import { TbCurrencyKroneCzech } from 'react-icons/tb'
import { Domain } from '@/app/types/domains'
import { DomainType } from '@/app/types/domainType'
const deviceTypeIcon = {
  [deviceType.MOBILE]: (
    <HStack gap={2.5}>
      <Box width={'20px'} />
      <FaMobile size={'20px'} />
    </HStack>
  ),
  [deviceType.DESKTOP]: (
    <HStack gap={2.5}>
      <FaDesktop size={'20px'} />
      <Box width={'20px'} />
    </HStack>
  ),
  [deviceType.BOTH]: (
    <HStack gap={2.5}>
      <FaDesktop size={'20px'} />
      <FaMobile size={'20px'} />
    </HStack>
  )
}

const searchEngineIcon = {
  [SearchEngine.GOOGLE]: <FaGoogle size={'20px'} />,
  [SearchEngine.YAHOO]: <FaYahoo size={'20px'} />,
  [SearchEngine.BING]: <BiLogoBing size={'20px'} />,
  [SearchEngine.BAIDU]: <AiOutlineBaidu size={'20px'} />,
  [SearchEngine.NAVER]: <SiNaver size={'20px'} />,
  [SearchEngine.SEZNAM]: <TbCurrencyKroneCzech size={'20px'} />
}

const CampaignItem = ({
  campaign,
  backgroundColor,
  isCreator
}: {
  campaign: Campaign | SharedCampaign
  backgroundColor: string
  isCreator: boolean
}) => {
  const flagUrl = `https://flagsapi.com/${campaign.country_code || ''}/flat/24.png`
  const keywordCounts = { top1: 0, top3: 0, top5: 0, top10: 0, top30: 0, top100: 0 }
  if ('domains' in campaign) {
    const ownDomain = campaign.domains.find((domain: Domain) => domain.domain_type === DomainType.OWN)
    if (ownDomain) {
      ownDomain.keywords.forEach((item: { position: number }) => {
        const position = item.position || 0
        if (position === 1) {
          keywordCounts.top1++
        } else if (position <= 3 && position > 1) {
          keywordCounts.top3++
        } else if (position <= 5 && position > 3) {
          keywordCounts.top5++
        } else if (position <= 10 && position > 5) {
          keywordCounts.top10++
        } else if (position <= 30 && position > 10) {
          keywordCounts.top30++
        } else if (position <= 100 && position > 10) {
          keywordCounts.top100++
        } else if (position === 0) {
          keywordCounts.top100++
        }
      })
    }
  }

  const pathname = usePathname()
  return (
    <Table.Row border="none" backgroundColor={backgroundColor} paddingX={2}>
      <Table.Cell width="fit-content" paddingY={3} paddingLeft={4}>
        {campaign.updating ? (
          <Text fontWeight={'600'} fontSize={'sm'} color={'gray.500'}>
            {campaign.name} (Updating...)
          </Text>
        ) : (
          <ChakraLink
            color={'primary.500'}
            fontWeight={'600'}
            fontSize={'sm'}
            asChild
            _focus={{ outline: 'none' }}
            _hover={{ textDecoration: 'underline', color: 'primary.700' }}
          >
            <Link href={`/campaigns/${campaign.id || ''}`}>{campaign.name || ''}</Link>
          </ChakraLink>
        )}
      </Table.Cell>
      {pathname === routes.SHARE_CAMPAIGN && (
        <Table.Cell paddingY={3} paddingLeft={4} fontWeight={'500'} color={'gray.700'} fontSize={'sm'}>
          {isCreator ? 'Me' : campaign.shared_By || ''}
        </Table.Cell>
      )}
      <Table.Cell paddingY={3} paddingLeft={4} fontWeight={'500'} color={'gray.700'} fontSize={'sm'}>
        {campaign.keyword_count || 0}
      </Table.Cell>
      <Table.Cell paddingY={1} color={'gray.700'} fontSize={'sm'}>
        <Text>{searchEngineIcon[campaign.search_engine as SearchEngine] || ''}</Text>
      </Table.Cell>
      <Table.Cell paddingY={1} color="gray.500">
        <Text>{deviceTypeIcon[campaign.devices] || ''}</Text>
      </Table.Cell>
      <Table.Cell>
        <Box marginLeft={3}>
          <Image width={'20px'} src={flagUrl} alt={campaign.country_code || ''} />
        </Box>
      </Table.Cell>
      <Table.Cell paddingY={3} paddingLeft={4} fontWeight={'500'} color={'gray.700'} fontSize={'sm'}>
        <Text>{campaign.language || ''}</Text>
      </Table.Cell>
      <Table.Cell paddingY={3} paddingLeft={4} fontWeight={'500'} color={'gray.700'} fontSize={'sm'}>
        <Text as="span">{keywordCounts.top1}</Text>
      </Table.Cell>
      <Table.Cell paddingY={3} paddingLeft={4} fontWeight={'500'} color={'gray.700'} fontSize={'sm'}>
        <Text as="span">{keywordCounts.top3}</Text>
      </Table.Cell>
      <Table.Cell paddingY={3} paddingLeft={4} fontWeight={'500'} color={'gray.700'} fontSize={'sm'}>
        <Text as="span">{keywordCounts.top5}</Text>
      </Table.Cell>
      <Table.Cell paddingY={3} paddingLeft={4} fontWeight={'500'} color={'gray.700'} fontSize={'sm'}>
        <Text as="span">{keywordCounts.top10}</Text>
      </Table.Cell>
      <Table.Cell paddingY={3} paddingLeft={4} fontWeight={'500'} color={'gray.700'} fontSize={'sm'}>
        <Text as="span">{keywordCounts.top30}</Text>
      </Table.Cell>
      <Table.Cell paddingY={3} paddingLeft={4} fontWeight={'500'} color={'gray.700'} fontSize={'sm'}>
        <Text as="span">{keywordCounts.top100}</Text>
      </Table.Cell>
      {pathname !== routes.SHARE_CAMPAIGN && (
        <Table.Cell padding={3} width={'82px'}>
          <ItemActionMenu campaignId={campaign.id} />
        </Table.Cell>
      )}
      {pathname === routes.SHARE_CAMPAIGN && <Table.Cell padding={3} width={'0px'} />}
    </Table.Row>
  )
}

export default CampaignItem
