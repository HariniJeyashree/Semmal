import warnings
from duckduckgo_search import DDGS

with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    with DDGS() as ddgs:
        query = 'SQL window functions tutorial freecodecamp'
        print('Query:', query)
        results = list(ddgs.text(query, max_results=3))
        print('Results:', results)
