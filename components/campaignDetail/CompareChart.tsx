import { AccordionItemContent, Box, Text } from '@chakra-ui/react'
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from 'recharts'
import { AccordionRoot, AccordionItem, AccordionItemTrigger } from '../ui/accordion'
import { FormValues } from '@/app/types/formValuesCampaign'
import { Domain } from '@/app/types/domains'
import { countKeywordsByPosition } from '@/utils/countKeywordsByPosition'
import { color } from '@/app/constant/color'
import { useFormContext } from 'react-hook-form'

interface ChartDataItem {
  name: string
  own: number
  [key: string]: string | number // allows dynamic competitor keys
}

const CompareChart = () => {
  const { watch } = useFormContext<FormValues>()
  const values = watch()

  const domains = values.domains

  function createChartData(domains: Domain[]) {
    const ownDomain = domains.find((domain: Domain) => domain.domain_type === 'own')
    const competitors = domains.filter((d: Domain) => d.domain_type === 'competitor')
    if (!ownDomain) return []
    const ownCounts = countKeywordsByPosition(ownDomain)
    const baseData = [
      { name: 'Top 01', own: ownCounts.top1 },
      { name: 'Top 03', own: ownCounts.top3 },
      { name: 'Top 05', own: ownCounts.top5 },
      { name: 'Top 10', own: ownCounts.top10 },
      { name: 'Top 30', own: ownCounts.top30 },
      { name: 'Top 100', own: ownCounts.top100 },
      { name: 'Total keywords', own: ownCounts.total }
    ]

    competitors.forEach((competitor, index) => {
      const competitorCounts = countKeywordsByPosition(competitor)
      const competitorKey = `competitor${index + 1}`

      baseData.forEach((item: ChartDataItem) => {
        const position = item.name.toLowerCase().replace(' ', '')
        const countKey = position === 'totalkeywords' ? 'total' : position.replace('top0', 'top')
        item[competitorKey] = competitorCounts[countKey as keyof typeof competitorCounts]
      })
    })
    return baseData
  }
  const chartData = createChartData(domains)
  const competitors = domains?.filter((d: any) => d.domain_type === 'competitor') || []
  const baseHeight = 400 // Chiều cao cơ bản
  const heightPerDomain = 100 // Chiều cao thêm cho mỗi domain
  const totalDomains = competitors.length + 1 // +1 cho domain chính
  const chartHeight = baseHeight + heightPerDomain * totalDomains
  return (
    <AccordionRoot
      borderRadius={'lg'}
      padding={2}
      backgroundColor={'white'}
      variant={'plain'}
      defaultValue={['Compare Chart']}
      boxShadow={'base'}
    >
      <AccordionItem value={'Compare Chart'}>
        <AccordionItemTrigger indicatorPlacement="none" backgroundColor={'primary.50'} paddingX={4} paddingY={2}>
          <Text color={'gray.900'} fontWeight={'semibold'} fontSize={'sm'}>
            Compare Chart
          </Text>
        </AccordionItemTrigger>
        <AccordionItemContent paddingX={4}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 20, right: 30, bottom: 5 }}
              barCategoryGap={20} // Khoảng cách giữa các nhóm bar
            >
              <CartesianGrid
                strokeDasharray="3 3" // Đường grid mỏng hơn
                horizontal={true} // Chỉ hiện grid ngang
              />
              <XAxis type="number" domain={[0, 'dataMax']} />
              <YAxis dataKey="name" type="category" width={120} />
              <Legend
                verticalAlign="top"
                align="center"
                height={100}
                layout="horizontal"
                wrapperStyle={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                  lineHeight: '20px'
                }}
              />
              {/* <Tooltip formatter={(value, name) => [value, name]} filterNull={true} coordinate={{ x: 100, y: 140 }} /> */}
              <Bar
                dataKey="own"
                radius={[0, 6, 6, 0]}
                fill={color[0]}
                name={`${domains.find((d: any) => d.domain_type === 'own')?.domain} (Own)` || 'Own domain'}
                minPointSize={8}
              />
              {competitors.map((competitor, index) => (
                <Bar
                  radius={[0, 6, 6, 0]}
                  key={competitor.id}
                  dataKey={`competitor${index + 1}`}
                  fill={color[index + 1]}
                  name={`${competitor.domain} (Competitor)`}
                  minPointSize={8}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </AccordionItemContent>
      </AccordionItem>
    </AccordionRoot>
  )
}

export default CompareChart
