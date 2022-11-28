import cardDb from './cardDb.json';

const CardList = () => {
  return (
    <ol>
      { Object.entries(cardDb).map(([key, cardData]) => (
        <li>
          <img src={`/assets/images/100-card_${key}.png`} alt={`artwork for ${cardData.SongRef}`}/>
          {cardData.ArtistRef} - {cardData.SongRef}
        </li>
      ))}
    </ol>
  )
}

export default CardList;
