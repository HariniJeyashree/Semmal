import asyncio
from agents.interview_evaluator import evaluate_answer

async def main():
    job_description = "We are looking for a Software Engineer with Python and React."
    question = "Can you walk me through a scenario where you integrated multiple data sources?"
    answer = "I used Snowflake and Power BI to create dashboards. It was a complex project."
    
    try:
        result = await evaluate_answer(job_description, question, answer)
        print("Success:", result)
    except Exception as e:
        print("Error during evaluation:", e)

if __name__ == "__main__":
    asyncio.run(main())
