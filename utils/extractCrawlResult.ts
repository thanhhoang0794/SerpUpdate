export function extractSearchResults(jsonData: any) {
	const items = jsonData.tasks[0].result[0].items;
	const processedResults = items.map((item: any) => {
		return {

			rank: item.rank_absolute,
			domain: item.domain,
			title: item.title,
			description: item.description,
			url: item.url,
			type: item.type,
			breadcrumb: item.breadcrumb,
		};
	});

	return processedResults;
}