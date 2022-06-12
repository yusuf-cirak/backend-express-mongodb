const Question = require("../../models/Question");

const searchHelper = (searchKey, query, req) => {
  if (req.query.search) {
    const searchObject = {};
    const regex = new RegExp(req.query.search, "i"); // case insensitive bir şekilde değerleri al
    searchObject[searchKey] = regex;

    return query.where(searchObject);
  }
  return query;
};

const populateHelper = (query, population) => {
  return query.populate(population);
};

const questionSortHelper = (query, req) => {
  const sortKey = req.query.sortBy; // sortBy değerimizi query'den alacağız.

  if (sortKey === "most-answered") query = query.sort("-answerCount");

  if (sortKey === "most-liked") query = query.sort("-likeCount");

  return query.sort("-createdAt");
};

const paginationHelper = async (totalDocuments, query, req) => {
  const page = parseInt(req.query.page) || 1; // sayfa sayısını query'den alacağız, verilmemişse 1. sayfadan başlayacak.
  // değerler string olarak geldiği için parseInt kullanıyoruz.
  const limit = parseInt(req.query.limit) || 5; // sayfada kaç adet değer(ürün) gelecek? query'den bunu da alacağız, verilmiyorsa 5 ürün gelecek

  // Mongoose'da skip ve limit gibi methodlar var.
  // 1 2 3 4 5 6 7 8 9 10
  // skip (2) dersek ilk 2 değeri atlar ve diğerlerini getirir. yani 0. ve 1. index atlanır, 2. indexten devam edilir. (2,3,4,5,6...10)
  // limit(2) dersek ilk 2 değer atlanır ve sonraki 2 değer alınır. yani 2. index ve 3. indec alınır. (3,4)
  const startIndex = (page - 1) * limit; // page-1 deme sebebimiz index muhabbetinden dolayı. 1. sayfadan başlamamız gerekiyor.
  const endIndex = page * limit;

  // startIndex ve endIndex bir sayfada kaç kayıt göstereceğimiz hakkında.

  const pagination = {};

  const total = totalDocuments;

  if (startIndex > 0) {
    // startIndex 0'dan büyükse bizim önceki bir sayfamız vardır.
    pagination.previous = {
      page: page - 1,
      limit: limit,
    };
  }
  if (endIndex < total) {
    // bir sonraki sayfanın olması için endIndex total document yani kayıt sayısından küçük olmalı.
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }

  return {
    query:
      query === undefined ? undefined : query.skip(startIndex).limit(limit), // skip ile startIndex'ten itibaren atla, limit ile limit değeri kadar kayıt al.
    pagination: pagination,
    startIndex,
    limit
  };
};

module.exports = {
  searchHelper,
  populateHelper,
  questionSortHelper,
  paginationHelper,
};
