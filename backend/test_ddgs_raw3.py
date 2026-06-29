import sys
import asyncio
from ddgs import DDGS

async def test():
    print('Testing SQL Window Functions...')
    try:
        with DDGS() as ddgs:
            query = '"SQL window functions" tutorial site:freecodecamp.org OR site:developer.mozilla.org OR site:khanacademy.org OR site:youtube.com'
            results = list(ddgs.text(query, max_results=3))
            for r in results:
                print(f"Title: {r.get('title')}\nURL: {r.get('href')}\n")
    except Exception as e:
        print('Error:', e)

asyncio.run(test())
