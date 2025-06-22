"use client";

import { useEffect, useState } from "react";

// import { ethers } from 'ethers';

// const ABI = [
//     "function safeMint(address to) public returns (uint256)"
// ];

interface ImageCard {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
}

const ImageShopComponent = () => {
  const [images, setImages] = useState<ImageCard[]>([
    {
      id: 1,
      title: "Горный пейзаж",
      price: 1500,
      imageUrl: "https://source.unsplash.com/random/300x200/?mountain",
    },
    {
      id: 2,
      title: "Морской закат",
      price: 2000,
      imageUrl: "https://source.unsplash.com/random/300x200/?sunset",
    },
    {
      id: 3,
      title: "Лесная тропа",
      price: 1200,
      imageUrl: "https://source.unsplash.com/random/300x200/?forest",
    },
  ]);

  // Состояния для покупки
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [currentImageId, setCurrentImageId] = useState<number | null>(null);
  const [address, setAddress] = useState("");

  // Состояния для добавления новой картинки
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [newImage, setNewImage] = useState({
    title: "",
    price: "",
    imageUrl: "",
  });

  // const [signer, setSigner] = useState(null);
  // const [provider, setProvider] = useState(null);

  // Эффект для блокировки скролла при открытой модалке
  useEffect(() => {
    if (showAddressModal || showAddImageModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showAddressModal, showAddImageModal]);

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

  const handleBuyClick = (imageId: number) => {
    setCurrentImageId(imageId);
    setShowAddressModal(true);
  };

  const handlePurchaseConfirm = () => {
    if (!address.trim()) {
      alert("Пожалуйста, введите адрес доставки");
      return;
    }

    console.log(`Покупка картины ID: ${currentImageId}`);
    console.log(`Адрес доставки: ${address}`);

    setShowAddressModal(false);
    setAddress("");
    setCurrentImageId(null);

    alert("Спасибо за покупку! Ваш заказ оформлен.");
  };

  const handleAddImageClick = () => {
    setShowAddImageModal(true);
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewImage(prev => ({ ...prev, [name]: value }));
  };

  const handleAddImageSubmit = async () => {
    if (!newImage.title.trim() || !newImage.price.trim() || !newImage.imageUrl.trim()) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    const price = parseFloat(newImage.price);
    if (isNaN(price) || price <= 0) {
      alert("Пожалуйста, введите корректную цену");
      return;
    }

    const newImageCard: ImageCard = {
      id: Date.now(), // Используем timestamp как временный ID
      title: newImage.title,
      price: price,
      imageUrl: newImage.imageUrl,
    };

    setImages(prev => [...prev, newImageCard]);
    setNewImage({ title: "", price: "", imageUrl: "" });
    setShowAddImageModal(false);

    // const contractAddress = "";
    // const contract = new ethers.Contract(contractAddress, ABI, signer);
    // const tx = await contract.safeMint(signer.getAddress());
    // await tx.wait();
    alert("Картинка успешно добавлена на продажу!");
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Кнопка добавления и список карточек */}
      <div className={`${showAddressModal || showAddImageModal ? "blur-sm" : ""}`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Галерея картин</h1>
          <button
            onClick={handleAddImageClick}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded transition"
          >
            Добавить картинку
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map(image => (
            <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={image.imageUrl}
                alt={image.title}
                className="w-full h-48 object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=Image+not+found";
                }}
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{image.title}</h2>
                <p className="text-gray-600 mb-4">{image.price} руб.</p>
                <button
                  onClick={() => handleBuyClick(image.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
                >
                  Купить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно для ввода адреса при покупке */}
      {showAddressModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={() => setShowAddressModal(false)}
          />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full z-50">
            <h2 className="text-xl font-bold mb-4">Оформление покупки</h2>
            <p className="mb-4">Пожалуйста, введите ваш адрес для доставки:</p>

            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-4"
              rows={3}
              placeholder="Введите полный адрес доставки"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddressModal(false);
                  setAddress("");
                }}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                Отмена
              </button>
              <button
                onClick={handlePurchaseConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для добавления новой картинки */}
      {showAddImageModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={() => setShowAddImageModal(false)}
          />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full z-50">
            <h2 className="text-xl font-bold mb-4">Добавить картинку на продажу</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название картинки</label>
                <input
                  type="text"
                  name="title"
                  value={newImage.title}
                  onChange={handleNewImageChange}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Введите название"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Цена (руб.)</label>
                <input
                  type="number"
                  name="price"
                  value={newImage.price}
                  onChange={handleNewImageChange}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Введите цену"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL изображения</label>
                <textarea
                  name="imageUrl"
                  value={newImage.imageUrl}
                  onChange={handleNewImageChange}
                  className="w-full border border-gray-300 rounded p-2"
                  rows={2}
                  placeholder="Введите URL картинки"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddImageModal(false);
                  setNewImage({ title: "", price: "", imageUrl: "" });
                }}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                Отмена
              </button>
              <button
                onClick={handleAddImageSubmit}
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

export default ImageShopComponent;
