// queries.js
// MongoDB queries for PLP Bookstore Assignment

const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017"; // Change if using Atlas
const dbName = "plp_bookstore";
const collectionName = "books";

async function runQueries() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const books = db.collection(collectionName);

    // -------------------------
    // Task 2: Basic CRUD
    // -------------------------
    console.log("\n--- BASIC CRUD ---");

    // 1. Find all books in a specific genre
    const fictionBooks = await books.find({ genre: "Fiction" }).toArray();
    console.log("\nFiction Books:", fictionBooks);

    // 2. Find books published after a certain year
    const recentBooks = await books.find({ published_year: { $gt: 2000 } }).toArray();
    console.log("\nBooks published after 2000:", recentBooks);

    // 3. Find books by a specific author
    const orwellBooks = await books.find({ author: "George Orwell" }).toArray();
    console.log("\nBooks by George Orwell:", orwellBooks);

    // 4. Update the price of a specific book
    const updateResult = await books.updateOne(
      { title: "1984" },
      { $set: { price: 12.99 } }
    );
    console.log("\nUpdate Result:", updateResult.modifiedCount, "book updated");

    // 5. Delete a book by its title
    const deleteResult = await books.deleteOne({ title: "Moby Dick" });
    console.log("\nDelete Result:", deleteResult.deletedCount, "book deleted");

    // -------------------------
    // Task 3: Advanced Queries
    // -------------------------
    console.log("\n--- ADVANCED QUERIES ---");

    // 1. Books in stock and published after 2010
    const inStockRecent = await books.find({ in_stock: true, published_year: { $gt: 2010 } }).toArray();
    console.log("\nIn-stock books published after 2010:", inStockRecent);

    // 2. Projection (title, author, price)
    const projection = await books.find({}, { projection: { title: 1, author: 1, price: 1, _id: 0 } }).toArray();
    console.log("\nProjection (title, author, price):", projection);

    // 3. Sort by price ascending
    const sortAsc = await books.find().sort({ price: 1 }).toArray();
    console.log("\nBooks sorted by price (asc):", sortAsc);

    // 4. Sort by price descending
    const sortDesc = await books.find().sort({ price: -1 }).toArray();
    console.log("\nBooks sorted by price (desc):", sortDesc);

    // 5. Pagination: 5 books per page
    const page1 = await books.find().limit(5).skip(0).toArray();
    const page2 = await books.find().limit(5).skip(5).toArray();
    console.log("\nPage 1:", page1);
    console.log("\nPage 2:", page2);

    // -------------------------
    // Task 4: Aggregation Pipeline
    // -------------------------
    console.log("\n--- AGGREGATION ---");

    // 1. Average price by genre
    const avgPriceByGenre = await books.aggregate([
      { $group: { _id: "$genre", avgPrice: { $avg: "$price" } } }
    ]).toArray();
    console.log("\nAverage price by genre:", avgPriceByGenre);

    // 2. Author with the most books
    const mostBooksAuthor = await books.aggregate([
      { $group: { _id: "$author", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray();
    console.log("\nAuthor with most books:", mostBooksAuthor);

    // 3. Group by publication decade
    const booksByDecade = await books.aggregate([
      { $group: { 
          _id: { $multiply: [ { $floor: { $divide: ["$published_year", 10] } }, 10 ] },
          count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]).toArray();
    console.log("\nBooks grouped by decade:", booksByDecade);

    // -------------------------
    // Task 5: Indexing
    // -------------------------
    console.log("\n--- INDEXING ---");

    // 1. Index on title
    const titleIndex = await books.createIndex({ title: 1 });
    console.log("\nTitle index created:", titleIndex);

    // 2. Compound index on author and published_year
    const compoundIndex = await books.createIndex({ author: 1, published_year: -1 });
    console.log("\nCompound index created:", compoundIndex);

    // 3. Explain query performance
    const explainTitle = await books.find({ title: "1984" }).explain("executionStats");
    console.log("\nExplain for title query:", explainTitle.executionStats);

    const explainAuthor = await books.find({ author: "George Orwell" }).sort({ published_year: -1 }).explain("executionStats");
    console.log("\nExplain for author query:", explainAuthor.executionStats);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
    console.log("\nConnection closed");
  }
}

runQueries();
