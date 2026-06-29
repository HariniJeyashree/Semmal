import warnings
from duckduckgo_search import DDGS

with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    with DDGS() as ddgs:
        query = 'SQL window functions tutorial site:freecodecamp.org OR site:developer.mozilla.org OR site:khanacademy.org'
        print('Query:', query)
        results = list(ddgs.text(query, max_results=5))
        print('Results:', results)
