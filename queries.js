export const queries = {
// -------------------------------------------------------------------
    listNamedGraphsWithTripleCount: `
SELECT ?graph (COUNT(*) AS ?triples) WHERE {
    GRAPH ?graph { ?s ?p ?o }
}
GROUP BY ?graph
ORDER BY DESC(?triples)`,
// -------------------------------------------------------------------
    listTriplesInSpecificGraph: `
SELECT ?s ?p ?o WHERE {
    GRAPH <https://open.bydata.de/oddmuc26#workshop_exampleGraph> { 
        ?s ?p ?o
    }
} LIMIT 10`,
// -------------------------------------------------------------------
    listTriplesInSetOfGraphs: `
PREFIX odd: <https://open.bydata.de/oddmuc26#>

SELECT ?g ?s ?p ?o WHERE {
    VALUES ?g {
        odd:workshop_exampleGraph1
        odd:workshop_exampleGraph2
    } 
    GRAPH ?g {
        ?s ?p ?o
    }
} LIMIT 10`,
// -------------------------------------------------------------------
    joinGraphsBySharedObject: `
PREFIX odd: <https://open.bydata.de/oddmuc26#>

SELECT ?s1 ?p1 ?o ?p2 ?o2 WHERE {
    GRAPH odd:workshop_exampleGraph1 {
        ?s1 ?p1 ?o .
    }
    GRAPH odd:workshop_exampleGraph2 {
        ?o ?p2 ?o2 .
    }
} LIMIT 10`,
// -------------------------------------------------------------------
    fromDistributionToDataset_portal: `
PREFIX dcat: <http://www.w3.org/ns/dcat#>

SELECT * WHERE { 
  	?dataset a dcat:Dataset ;
        dcat:distribution <https://open.bydata.de/api/hub/repo/distributions/4808588b-a630-4c71-a1af-814707c52e79> .
}`,
// -------------------------------------------------------------------
    countTotalDatasets_portal: `
PREFIX dcat: <http://www.w3.org/ns/dcat#>

SELECT (COUNT(?dataset) as ?count) WHERE {
	?dataset a dcat:Dataset .
}`,
// -------------------------------------------------------------------
    distinctDistributionFormats_portal: `
PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX dct: <http://purl.org/dc/terms/>

SELECT DISTINCT ?format WHERE {
	?dataset a dcat:Dataset ;
  	dcat:distribution ?distribution .
  	?distribution dct:format ?format .
}`,
// -------------------------------------------------------------------
    datasetsWithLodDistributions_portal: `
PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX filetype: <http://publications.europa.eu/resource/authority/file-type/>

SELECT DISTINCT ?catalogTitle ?datasetTitle WHERE { 
	?cat a dcat:Catalog ;
  		dct:title ?catalogTitle ;
  		dcat:dataset ?dataset .
  	?dataset a dcat:Dataset ;
  		dct:title ?datasetTitle ;
  		dcat:distribution ?distribution .
  	?distribution dct:format ?format .
  	VALUES ?format { filetype:JSON_LD filetype:JSONLD filetype:RDFXML filetype:TURTLE filetype:N3 }
}`
}
