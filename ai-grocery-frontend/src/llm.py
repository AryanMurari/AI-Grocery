import os
import json
from typing import Dict, List, Optional, Any

from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.output_parsers import ResponseSchema, StructuredOutputParser

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Set your OpenAI API key from environment variable
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "")

# Define the output schema for structured parsing
product_schema = ResponseSchema(
    name="products",
    description="A list of products with their quantities identified in the order text. Each item should include the product name and quantity."
)

unrecognized_schema = ResponseSchema(
    name="unrecognized_items",
    description="A list of items mentioned in the order that could not be matched to known products."
)

output_parser = StructuredOutputParser([product_schema, unrecognized_schema])
format_instructions = output_parser.get_format_instructions()

# Create the prompt template
template = """
You are an AI assistant for a grocery shopping app. Your task is to analyze customer orders written in natural language and extract structured information.

Given the following grocery order text, identify all the products and their quantities. If a quantity is not specified, assume it is 1.

Input Order: {order_text}

Our product database contains items in these categories:
- Produce (fruits, vegetables)
- Dairy & Alternatives
- Bakery
- Meat & Seafood
- Grains
- Staples (rice, flour, etc.)
- Pulses (lentils, beans)
- Spices
- Oils & Condiments
- Dry Fruits & Nuts
- Beverages
- Ready-Made foods

{format_instructions}

Please be precise in identifying specific products rather than generic categories.
"""

prompt = PromptTemplate(
    template=template,
    input_variables=["order_text"],
    partial_variables={"format_instructions": format_instructions}
)

# Initialize the language model
llm = ChatOpenAI(
    model_name="gpt-4o",
    temperature=0,
)

# Create the chain
chain = LLMChain(llm=llm, prompt=prompt)

def process_natural_language_order(order_text: str) -> Dict[str, Any]:
    """
    Process a natural language grocery order and extract structured information.
    
    Args:
        order_text: The natural language order text from the customer
        
    Returns:
        A dictionary containing the parsed products and unrecognized items
    """
    try:
        # Run the chain
        response = chain.run(order_text=order_text)
        
        # Parse the structured output
        parsed_output = output_parser.parse(response)
        
        # Return the parsed products and unrecognized items
        return {
            "matched_products": parsed_output.get("products", []),
            "unmatched_items": parsed_output.get("unrecognized_items", [])
        }
    except Exception as e:
        print(f"Error processing order: {e}")
        return {
            "matched_products": [],
            "unmatched_items": [order_text],
            "error": str(e)
        }

def match_with_product_database(parsed_items: List[Dict]) -> Dict:
    """
    Match the parsed items with the actual product database.
    
    Args:
        parsed_items: List of parsed items with their quantities
        
    Returns:
        A dictionary with matched products and unmatched items
    """
    # In a real implementation, this would query your product database
    # For now, we'll simulate with a dummy implementation
    
    matched_products = []
    unmatched_items = []
    
    # This would be replaced with actual database logic
    for item in parsed_items:
        # Simulate product matching
        product_name = item.get("name")
        quantity = item.get("quantity", 1)
        
        # Here you would query your database - simulating for now
        is_found = True  # This would be the result of your database query
        
        if is_found:
            matched_products.append({
                "product": {
                    "id": "sample-id",  # This would come from your database
                    "name": product_name,
                    # Other product details would be added here
                },
                "quantity": quantity
            })
        else:
            unmatched_items.append(product_name)
    
    return {
        "matched_products": matched_products,
        "unmatched_items": unmatched_items
    }

def process_order(order_text: str) -> Dict:
    """
    Main function to process a customer's grocery order.
    
    Args:
        order_text: The natural language order text from the customer
        
    Returns:
        A dictionary with the processed order details
    """
    # First, use LLM to parse the natural language order
    parsed_result = process_natural_language_order(order_text)
    
    # Then match the parsed items with the actual product database
    if "error" not in parsed_result:
        return match_with_product_database(parsed_result.get("matched_products", []))
    else:
        return parsed_result

# Example usage
if __name__ == "__main__":
    sample_order = "I need 2 avocados, a loaf of whole grain bread, a dozen eggs, and some greek yogurt. Also, can you add some turmeric powder?"
    result = process_order(sample_order)
    print(json.dumps(result, indent=2))
