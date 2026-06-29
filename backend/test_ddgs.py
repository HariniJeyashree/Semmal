import sys
import asyncio
from agents.skill_gap_analyzer import fetch_resources_for_skill

async def test():
    print('Testing SQL Window Functions...')
    res = await fetch_resources_for_skill('SQL window functions')
    for r in res:
        print(f"Title: {r.title}\nURL: {r.url}\nType: {r.type}\n")
    print('Testing Power BI DAX...')
    res = await fetch_resources_for_skill('Power BI DAX')
    for r in res:
        print(f"Title: {r.title}\nURL: {r.url}\nType: {r.type}\n")

asyncio.run(test())
