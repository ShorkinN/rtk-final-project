"use client";

import { useEffect, useState } from "react";

interface NftCard {
  id: number;
  price: number;
  nftUri: string;
}

const NftMarketComponent = () => {
  const [nfts, setNfts] = useState<NftCard[]>([
    {
      id: 1,
      price: 1500,
      nftUri:
        "https://media.istockphoto.com/id/1419410282/ru/%D1%84%D0%BE%D1%82%D0%BE/%D1%82%D0%B8%D1%85%D0%B8%D0%B9-%D0%BB%D0%B5%D1%81-%D0%B2%D0%B5%D1%81%D0%BD%D0%BE%D0%B9-%D1%81-%D0%BA%D1%80%D0%B0%D1%81%D0%B8%D0%B2%D1%8B%D0%BC%D0%B8-%D1%8F%D1%80%D0%BA%D0%B8%D0%BC%D0%B8-%D1%81%D0%BE%D0%BB%D0%BD%D0%B5%D1%87%D0%BD%D1%8B%D0%BC%D0%B8-%D0%BB%D1%83%D1%87%D0%B0%D0%BC%D0%B8.jpg?s=2048x2048&w=is&k=20&c=eXaxdkzHMWHRRK1QFzzhiXSZKG_SyR1k9iVK7g7f6X8=",
    },
    {
      id: 2,
      price: 2000,
      nftUri:
        "https://media.istockphoto.com/id/1317323736/ru/%D1%84%D0%BE%D1%82%D0%BE/%D0%B2%D0%B8%D0%B4-%D0%BD%D0%B0-%D0%BD%D0%B5%D0%B1%D0%BE-%D0%BD%D0%B0%D0%BF%D1%80%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D1%8F-%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D1%8C%D0%B5%D0%B2.webp?s=2048x2048&w=is&k=20&c=3Ji6Rih43HT6XUBi0ESTJ6ihCqH123ESZUxYqUBaoWc=",
    },
    {
      id: 3,
      price: 1200,
      nftUri:
        "https://media.istockphoto.com/id/1322277517/ru/%D1%84%D0%BE%D1%82%D0%BE/%D0%B4%D0%B8%D0%BA%D0%B0%D1%8F-%D1%82%D1%80%D0%B0%D0%B2%D0%B0-%D0%B2-%D0%B3%D0%BE%D1%80%D0%B0%D1%85-%D0%BD%D0%B0-%D0%B7%D0%B0%D0%BA%D0%B0%D1%82%D0%B5.webp?s=2048x2048&w=is&k=20&c=SK1eye3LU9LfhttAe_VXqOx4bTNTAYrv0Jeh0vmN0yA=",
    },
  ]);

  const [currentNftId, setCurrentNftId] = useState<number | null>(null);
  const [showAddNftModal, setShowAddNftModal] = useState(false);
  const [newNft, setNewNft] = useState({
    price: "",
    nftUri: "",
  });

  // const [signer, setSigner] = useState(null);
  // const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (showAddNftModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showAddNftModal]);

  // useEffect(() => {
  //   async function init() {
  //       let _provider, _signer;
  //       if (window.ethereum == null) {
  //           console.log("MetaMask not installed; using read -only defaults")
  //           _provider = ethers.getDefaultProvider();
  //       } else {
  //           _provider = new ethers.BrowserProvider(window.ethereum);
  //           _signer = await _provider.getSigner();
  //       }
  //       setProvider(_provider);
  //       setSigner(_signer);
  //   }
  //   init();
  // }, []);

  const handleBuyClick = (nftId: number) => {
    setCurrentNftId(nftId);
    // TODO вызывать buyToken из контракта с заданным currentNftId
    // получить через метод getMarketItems() обновленный список NFT и засетить в стейт
    alert("TODO: покупка nft с id " + nftId + currentNftId);
    setCurrentNftId(null);
  };

  const handleAddNftClick = () => {
    setShowAddNftModal(true);
  };

  const handleNewNftChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewNft(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNftSubmit = async () => {
    if (!newNft.price.trim() || !newNft.nftUri.trim()) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    const price = parseFloat(newNft.price);
    if (isNaN(price) || price <= 0) {
      alert("Пожалуйста, введите корректную цену");
      return;
    }

    const newNftCard: NftCard = {
      id: Date.now(),
      price: price,
      nftUri: newNft.nftUri,
    };

    // TODO вызывать метод контракта createToken()
    // TODO получить через метод getMarketItems() обновленный список NFT и засетить в стейт
    setNfts(prev => [...prev, newNftCard]);
    setNewNft({ price: "", nftUri: "" });
    setShowAddNftModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Список карточек */}
      <div className={`${showAddNftModal ? "blur-sm" : ""}`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Nft Market</h1>
          <button
            onClick={handleAddNftClick}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded transition"
          >
            Добавить картинку
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map(nft => (
            <div key={nft.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={nft.nftUri}
                alt={nft.id.toString()}
                className="w-full h-48 object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=Image+not+found";
                }}
              />
              <div className="p-4">
                <p className="text-gray-600 mb-4">{nft.price} wei</p>
                <button
                  onClick={() => handleBuyClick(nft.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
                >
                  Купить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно для добавления нового Nft */}
      {showAddNftModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={() => setShowAddNftModal(false)}
          />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full z-50">
            <h2 className="text-xl font-bold mb-4">Добавить Nft на продажу</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Цена (wei)</label>
                <input
                  type="number"
                  name="price"
                  value={newNft.price}
                  onChange={handleNewNftChange}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Введите цену"
                  min="1"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URI Nft</label>
                <textarea
                  name="nftUri"
                  value={newNft.nftUri}
                  onChange={handleNewNftChange}
                  className="w-full border border-gray-300 rounded p-2"
                  rows={2}
                  placeholder="Введите URI изображения"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddNftModal(false);
                  setNewNft({ price: "", nftUri: "" });
                }}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                Отмена
              </button>
              <button
                onClick={handleAddNftSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NftMarketComponent;
